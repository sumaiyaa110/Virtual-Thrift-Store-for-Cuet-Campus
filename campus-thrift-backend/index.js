require('dotenv').config();  // Load environment variables
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const fs = require('fs');
app.use(cors());

// Middleware to handle larger payloads
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

// =========== MULTER SETUP FOR IMAGE UPLOADS ============
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage: storage });

// Serve the uploads folder statically
app.use('/uploads', express.static(uploadDir));

// MySQL connection setup
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '#MentorMatrix#',
  database: 'campus_thrift',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'yourSuperSecretKey12345';

// ================== AUTH ROUTES ===================

// Signup Route
app.post('/api/signup', async (req, res) => {
  const { fullname, email, password, phone, role } = req.body;

  if (!fullname || !email || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (role === 'seller') {
    const cuetEmailRegex = /^u\d{2}(0[1-9]|1[0-2])\d{3}@student\.cuet\.ac\.bd$/;
    if (!cuetEmailRegex.test(email)) {
      return res.status(400).json({
        message: 'Seller email must be a valid CUET student email (e.g., u2104110@student.cuet.ac.bd)'
      });
    }
  }

  try {
      const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role]);
if (existingUsers.length > 0) {
  return res.status(400).json({ message: `Email already registered as ${role}` });
}
    const password_hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (fullname, email, password_hash, phone, role) VALUES (?, ?, ?, ?, ?)',
      [fullname, email, password_hash, phone, role]
    );

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

//Login route
app.post('/api/login', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Missing email, password, or role' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND role = ?',
      [email, role]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email, password, or role' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid email, password, or role' });
    }

    const token = jwt.sign(
      { userId: user.id, fullname: user.fullname, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ================== MIDDLEWARE ===================

function authenticateJWT(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(403).json({ message: 'Access denied, token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ================== PRODUCT ROUTES ===================

// Upload Product
app.post('/api/products', authenticateJWT, upload.single('image'), async (req, res) => {
  try {
    const { name, category, description, price, status, product_condition, featured } = req.body;

    // Check if image was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Construct image path and get seller ID from token
    const image = `/uploads/${req.file.filename}`;
    const sellerId = req.user.userId; // JWT payload contains `userId`

    // Insert product into database
    const sql = `
      INSERT INTO products 
      (sellerId, name, category, description, price, status, image, product_condition, featured) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const defaultStatus = 'inactive';  // or 'pending'

    const values = [
      sellerId,
      name,
      category,
      description,
      price,
      status || defaultStatus,
      image,
      product_condition,
      featured === 'true'
];


    await pool.query(sql, values);

    res.status(201).json({ message: 'Product uploaded successfully' });
  } catch (err) {
    console.error('[Server Error]', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get Products for Logged-in Seller
app.get('/api/products', authenticateJWT, async (req, res) => {
  const sellerId = req.user.userId;

  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE sellerId = ?', [sellerId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete Product
app.delete('/api/products/:id', authenticateJWT, async (req, res) => {
  const productId = req.params.id;
  const sellerId = req.user.userId;

  try {
    const [product] = await pool.query('SELECT * FROM products WHERE id = ? AND sellerId = ?', [productId, sellerId]);
    if (!product.length) {
      return res.status(404).json({ message: 'Product not found or unauthorized' });
    }

    await pool.query('DELETE FROM products WHERE id = ?', [productId]);
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: Get All Featured Products
app.get('/api/featured-products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE featured = true');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
// Get Orders for the logged-in Buyer
app.get('/api/orders', authenticateJWT, async (req, res) => {
  const buyerId = req.user.userId;  // Extract the buyer's ID from the JWT payload

  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE buyerId = ?', [buyerId]);
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});
// Get Wishlist for the logged-in Buyer
app.get('/api/wishlist', authenticateJWT, async (req, res) => {
  const buyerId = req.user.userId;

  try {
    const [wishlist] = await pool.query(`
      SELECT products.* FROM wishlist
      INNER JOIN products ON wishlist.productId = products.id
      WHERE wishlist.buyerId = ?`, [buyerId]);
    res.json(wishlist);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching wishlist' });
  }
});

// Get Cart for the logged-in Buyer
app.get('/api/cart', authenticateJWT, async (req, res) => {
  const buyerId = req.user.userId;

  try {
    const [cart] = await pool.query(`
      SELECT products.*, cart.quantity FROM cart
      INNER JOIN products ON cart.productId = products.id
      WHERE cart.buyerId = ?`, [buyerId]);
    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching cart items' });
  }
});
// Update Order Status (PUT route)
app.put('/api/orders/:id', authenticateJWT, async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;  // Get the new status from the request body

  // Check if the status is valid
  if (!['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Update the order status in the database
    const [result] = await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);

    // If no rows were updated, the order was not found
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Successfully updated the order status
    res.json({ message: 'Order status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public: Get All Products (for admin)
app.get('/api/all-products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.image, p.category, p.status, p.product_condition,
             p.description, p.featured, p.dateAdded,
             u.id AS seller_id, u.fullname AS seller_name
      FROM products p
      JOIN users u ON p.sellerId = u.id
      ORDER BY p.dateAdded DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching all products' });
  }
});

// Public route for buyers (only active products)
app.get('/api/buyer-products', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.id, p.name, p.price, p.image, p.category, p.status, p.product_condition,
             p.description, p.featured, p.dateAdded,
             u.id AS seller_id, u.fullname AS seller_name
      FROM products p
      JOIN users u ON p.sellerId = u.id
      WHERE p.status = 'active'
      ORDER BY p.dateAdded DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching buyer products' });
  }
});

app.post('/api/cart', authenticateJWT, async (req, res) => {
  const buyerId = req.user.userId;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    // Optional: Check if product already in cart
    const [existing] = await pool.query(
      'SELECT * FROM cart WHERE buyerId = ? AND productId = ?',
      [buyerId, productId]
    );

    if (existing.length > 0) {
      return res.status(200).json({ message: 'Already in cart' });
    }

    await pool.query(
      'INSERT INTO cart (buyerId, productId, quantity, addedAt) VALUES (?, ?, ?, NOW())',
      [buyerId, productId, 1]
    );

    res.status(201).json({ message: 'Added to cart' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
});

app.post('/api/wishlist', authenticateJWT, async (req, res) => {
  const buyerId = req.user.userId;
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ message: 'Product ID is required' });
  }

  try {
    const [existing] = await pool.query(
      'SELECT * FROM wishlist WHERE buyerId = ? AND productId = ?',
      [buyerId, productId]
    );

    if (existing.length > 0) {
      return res.status(200).json({ message: 'Already in wishlist' });
    }

    await pool.query(
      'INSERT INTO wishlist (buyerId, productId, addedAt) VALUES (?, ?, NOW())',
      [buyerId, productId]
    );

    res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add to wishlist' });
  }
});

// Get all buyers for admin
app.get('/api/admin/buyers', async (req, res) => {
  try {
    const [buyers] = await pool.query(`
      SELECT id, fullname, email, created_at 
      FROM users 
      WHERE role = 'buyer'
    `);
    res.json(buyers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching buyers' });
  }
});

// Delete user by ID (admin)
app.delete('/api/admin/user/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    await pool.query('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting user' });
  }
});

// Get all sellers for admin
app.get('/api/admin/sellers', async (req, res) => {
  try {
    const [sellers] = await pool.query(`
      SELECT id, fullname, email, created_at 
      FROM users 
      WHERE role = 'seller'
    `);
    res.json(sellers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sellers' });
  }
});

// Delete seller by ID (admin)
app.delete('/api/admin/seller/:id', async (req, res) => {
  try {
    const sellerId = req.params.id;
    await pool.query('DELETE FROM users WHERE id = ?', [sellerId]);
    res.json({ message: 'Seller deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting seller' });
  }
});

app.get('/api/admin/seller/:id/products-count', async (req, res) => {
  const sellerId = req.params.id;
  try {
    const [rows] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE sellerId = ?',
      [sellerId]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('Error fetching products count:', err);
    res.status(500).json({ message: 'Server error fetching products count' });
  }
});

app.get('/api/admin/seller/:id/sold-count', async (req, res) => {
  const sellerId = req.params.id;
  try {
    const [rows] = await pool.query(
      `SELECT COUNT(o.id) AS count
       FROM orders o
       JOIN products p ON o.productId = p.id
       WHERE p.sellerId = ? AND o.status = 'delivered'`,  // count only delivered orders as sold
      [sellerId]
    );
    res.json({ count: rows[0].count });
  } catch (err) {
    console.error('Error fetching sold count:', err);
    res.status(500).json({ message: 'Server error fetching sold count' });
  }
});

app.get('/api/admin/products', async (req, res) => {
  try {
    const [products] = await pool.query(`
      SELECT p.id, p.name, p.price, p.category, p.status, p.product_condition, p.featured,
             u.fullname AS seller_name, p.created_at
      FROM products p
      JOIN users u ON p.sellerId = u.id
      ORDER BY p.created_at DESC
    `);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});

app.get('/api/admin/sold-products', async (req, res) => {
  try {
    const [sold] = await pool.query(`
      SELECT o.id AS orderId, p.name AS productName, p.price, 
             u_seller.fullname AS sellerName,
             u_buyer.fullname AS buyerName, o.status, o.orderDate AS orderDate
      FROM orders o
      JOIN products p ON o.productId = p.id
      JOIN users u_seller ON p.sellerId = u_seller.id
      JOIN users u_buyer ON o.buyerId = u_buyer.id
      WHERE o.status = 'delivered'
      ORDER BY o.orderDate DESC
    `);
    res.json(sold);
  } catch (err) {
    console.error('Error fetching sold products:', err);
    res.status(500).json({ message: 'Error fetching sold products' });
  }
});

// Get Buyer Profile (with extracted student ID)
app.get('/api/buyer/profile', authenticateJWT, async (req, res) => {
  const buyerId = req.user.userId;

  try {
    const [rows] = await pool.query(
      `SELECT id, fullname, email, phone
       FROM users
       WHERE id = ? AND role = 'buyer'`,
      [buyerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Buyer profile not found' });
    }

    const buyer = rows[0];

    // Extract numeric student ID from email (e.g., u2104110@student.cuet.ac.bd -> 2104110)
    const studentId = buyer.email.split('@')[0].replace(/^u/, '');

    res.json({
      id: buyer.id,
      fullname: buyer.fullname,
      email: buyer.email,
      phone: buyer.phone,
      studentId: studentId
    });
  } catch (err) {
    console.error('Error fetching buyer profile:', err);
    res.status(500).json({ message: 'Error fetching buyer profile' });
  }
});

// Get Seller Profile (with extracted student ID)
app.get('/api/seller/profile', authenticateJWT, async (req, res) => {
  const sellerId = req.user.userId;

  try {
    const [rows] = await pool.query(
      `SELECT id, fullname, email, phone
       FROM users
       WHERE id = ? AND role = 'seller'`,
      [sellerId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Seller profile not found' });
    }

    const seller = rows[0];

    // Extract numeric student ID from email (e.g., u2104110@student.cuet.ac.bd -> 2104110)
    const studentId = seller.email.split('@')[0].replace(/^u/, '');

    res.json({
      id: seller.id,
      fullname: seller.fullname,
      email: seller.email,
      phone: seller.phone,
      studentId: studentId
    });
  } catch (err) {
    console.error('Error fetching seller profile:', err);
    res.status(500).json({ message: 'Error fetching seller profile' });
  }
});

// Admin Dashboard: Stats Summary
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [[{ buyers }]] = await pool.query(`SELECT COUNT(*) AS buyers FROM users WHERE role = 'buyer'`);
    const [[{ sellers }]] = await pool.query(`SELECT COUNT(*) AS sellers FROM users WHERE role = 'seller'`);
    const [[{ totalProducts }]] = await pool.query(`SELECT COUNT(*) AS totalProducts FROM products`);
    const [[{ soldToday }]] = await pool.query(`SELECT COUNT(*) AS soldToday FROM orders WHERE DATE(orderDate) = CURDATE()`);
    const [[{ addedToday }]] = await pool.query(`SELECT COUNT(*) AS addedToday FROM products WHERE DATE(dateAdded) = CURDATE()`);
    const [[{ messageCount }]] = await pool.query(`SELECT COUNT(*) AS messageCount FROM messages WHERE DATE(sentAt) = CURDATE()`);

    res.json({ buyers, sellers, totalProducts, soldToday, addedToday, messageCount });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ message: 'Failed to load dashboard stats' });
  }
});

// Admin Dashboard: Today’s Sold Items
app.get('/api/admin/sold-today', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.name AS productName,
        s.fullname AS sellerName,
        b.fullname AS buyerName,
        o.orderDate AS time
      FROM orders o
      JOIN products p ON o.productId = p.id
      JOIN users s ON p.sellerId = s.id
      JOIN users b ON o.buyerId = b.id
      WHERE DATE(o.orderDate) = CURDATE() AND o.status = 'delivered'
      ORDER BY o.orderDate DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('Error fetching today\'s sold items:', err);
    res.status(500).json({ message: 'Failed to load sold items' });
  }
});

// Admin Dashboard: Recent Messages (Buyer → Seller)
app.get('/api/admin/recent-messages', async (req, res) => {
  try {
    const [messages] = await pool.query(`
      SELECT m.message AS text, u.fullname AS user, m.sentAt
      FROM messages m
      JOIN users u ON m.buyerId = u.id
      ORDER BY m.sentAt DESC
      LIMIT 5
    `);
    res.json(messages);
  } catch (err) {
    console.error('Error fetching recent messages:', err);
    res.status(500).json({ message: 'Failed to load recent messages' });
  }
});

// Admin updates product status
app.put('/api/admin/products/:id/status', async (req, res) => {
  const productId = req.params.id;
  const { status } = req.body;

  if (!['active', 'sold'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE products SET status = ? WHERE id = ?',
      [status, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error('Error updating product status:', err);
    res.status(500).json({ message: 'Server error updating status' });
  }
});

app.delete('/api/cart/:productId', authenticateJWT, async (req, res) => {
  const buyerId = req.user.userId;
  const productId = req.params.productId;

  try {
    const [result] = await pool.query(
      'DELETE FROM cart WHERE buyerId = ? AND productId = ?',
      [buyerId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    res.json({ message: 'Item removed from cart successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

// Delete item from wishlist
app.delete('/api/wishlist/:id', authenticateJWT, async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.userId;

  try {
    const [result] = await pool.query(
      'DELETE FROM wishlist WHERE productId = ? AND buyerId = ?',
      [productId, userId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found in wishlist' });
    }
    res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Backend route: GET /api/buyer/dashboard
app.get('/api/buyer/dashboard', authenticateJWT, async (req, res) => {
  const buyerId = req.user.userId;

  try {
    const [[{ totalOrders }]] = await pool.query(`SELECT COUNT(*) AS totalOrders FROM orders WHERE buyerId = ?`, [buyerId]);
    const [[{ wishlistCount }]] = await pool.query(`SELECT COUNT(*) AS wishlistCount FROM wishlist WHERE buyerId = ?`, [buyerId]);
    const [[{ cartCount }]] = await pool.query(`SELECT COUNT(*) AS cartCount FROM cart WHERE buyerId = ?`, [buyerId]);

    const [recentOrders] = await pool.query(`
      SELECT o.id, o.orderDate, o.status, p.name AS productName, p.price, u.fullname AS sellerName
      FROM orders o
      JOIN products p ON o.productId = p.id
      JOIN users u ON p.sellerId = u.id
      WHERE o.buyerId = ?
      ORDER BY o.orderDate DESC
      LIMIT 5
    `, [buyerId]);

    res.json({
      totalOrders,
      wishlistCount,
      cartCount,
      recentOrders
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
});

// Create or get conversation between buyer & seller (optional product)
app.post('/api/chat/conversation', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const { buyerId, sellerId, product_id } = req.body;

  // Validate required fields
  if (!buyerId || !sellerId) {
    return res.status(400).json({ message: 'buyerId and sellerId are required' });
  }

  try {
    // Check if conversation already exists
    const [existing] = await pool.query(
      `SELECT * FROM conversations WHERE 
        buyerId = ? AND sellerId = ? AND (product_id <=> ?)`,
      [buyerId, sellerId, product_id || null]
    );

    if (existing.length > 0) {
      return res.json(existing[0]);
    }

    // Create new conversation
    const [result] = await pool.query(
      `INSERT INTO conversations (buyerId, sellerId, product_id) VALUES (?, ?, ?)`,
      [buyerId, sellerId, product_id || null]
    );

    const [newConversation] = await pool.query('SELECT * FROM conversations WHERE id = ?', [result.insertId]);
    res.status(201).json(newConversation[0]);
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/chat/send', authenticateJWT, async (req, res) => {
  const senderId = req.user.userId;
  const { conversation_id, message } = req.body;

  if (!conversation_id || !message) {
    return res.status(400).json({ message: 'conversation_id and message are required' });
  }

  try {
    // Verify conversation exists and user is part of it
    const [conv] = await pool.query(
      `SELECT * FROM conversations WHERE id = ? AND (buyerId = ? OR sellerId = ?)`,
      [conversation_id, senderId, senderId]
    );

    if (conv.length === 0) {
      return res.status(404).json({ message: 'Conversation not found or access denied' });
    }

    // Insert message
    const [result] = await pool.query(
      `INSERT INTO messages (conversation_id, sender_id, message) VALUES (?, ?, ?)`,
      [conversation_id, senderId, message]
    );

    const [newMessage] = await pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    res.status(201).json(newMessage[0]);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/chat/:conversationId/messages', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const conversationId = req.params.conversationId;

  try {
    // Verify user is part of conversation
    const [conv] = await pool.query(
      `SELECT * FROM conversations WHERE id = ? AND (buyerId = ? OR sellerId = ?)`,
      [conversationId, userId, userId]
    );

    if (conv.length === 0) {
      return res.status(404).json({ message: 'Conversation not found or access denied' });
    }

    // Fetch messages sorted by sentAt ascending
    const [messages] = await pool.query(
      `SELECT m.id, m.conversation_id, m.sender_id, m.message, m.sentAt, u.fullname AS sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.sentAt ASC`,
      [conversationId]
    );

    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Node.js backend route example
app.get('/api/chat/conversations', authenticateJWT, async (req, res) => {
  const userId = req.user.userId;
  const role = req.user.role;

  try {
    let rows;
    if (role === 'seller') {
      [rows] = await pool.query(`
        SELECT c.*, u.fullname AS buyer_name
        FROM conversations c
        JOIN users u ON c.buyerId = u.id
        WHERE c.sellerId = ?
        ORDER BY c.created_at DESC
      `, [userId]);
    } else if (role === 'buyer') {
      [rows] = await pool.query(`
        SELECT c.*, u.fullname AS seller_name
        FROM conversations c
        JOIN users u ON c.sellerId = u.id
        WHERE c.buyerId = ?
        ORDER BY c.created_at DESC
      `, [userId]);
    } else {
      return res.status(403).json({ message: 'Invalid user role' });
    }

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch conversations' });
  }
});

app.post('/api/seller/confirm-order', authenticateJWT, async (req, res) => {
  const { productId, buyerId } = req.body;
  const sellerId = req.user.id;

  if (!productId || !buyerId) {
    return res.status(400).json({ message: "Missing productId or buyerId" });
  }

  try {
    // Verify product belongs to seller and is still active
    const [productRows] = await pool.query(
      "SELECT * FROM products WHERE id = ? AND sellerId = ? AND status = 'active'",
      [productId, sellerId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found or already sold" });
    }

    const product = productRows[0];

    // Optional: Check if buyer has actually messaged (exists in conversation)
    const [convRows] = await pool.query(
      "SELECT * FROM conversations WHERE buyerId = ? AND sellerId = ? AND product_id = ?",
      [buyerId, sellerId, productId]
    );

    if (convRows.length === 0) {
      return res.status(400).json({ message: "This buyer has not messaged you about this product" });
    }

    // Insert into orders table
    await pool.query(
      `INSERT INTO orders (buyerId, productId, quantity, totalPrice, status, orderDate)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [buyerId, productId, 1, product.price, 'pending']
    );

    // Update product status
    await pool.query(
      `UPDATE products SET status = 'sold' WHERE id = ?`,
      [productId]
    );

    res.json({ message: "Order confirmed and product marked as sold" });

  } catch (err) {
    console.error("Confirm Order Error:", err);
    res.status(500).json({ message: "Server error while confirming order" });
  }
});

// POST /api/orders
app.post('/api/orders', authenticateJWT, async (req, res) => {
  const { buyerId, productId, quantity } = req.body;
  const sellerId = req.user.id;

  if (!buyerId || !productId || !quantity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Fetch product to get price
    const [productRows] = await pool.query('SELECT * FROM products WHERE id = ?', [productId]);
    if (!productRows.length) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productRows[0];

    // Insert order
    const totalPrice = product.price * quantity;
    await pool.query(
      `INSERT INTO orders (buyerId, productId, quantity, totalPrice, status, orderDate)
       VALUES (?, ?, ?, ?, 'pending', NOW())`,
      [buyerId, productId, quantity, totalPrice]
    );

    // Update product status to 'sold'
    await pool.query(`UPDATE products SET status = 'sold' WHERE id = ?`, [productId]);

    res.json({ message: 'Order confirmed and product marked as sold' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'cuet123'; // put your admin password in .env

  if (!password) {
    return res.status(400).json({ message: 'Password is required' });
  }

  if (password === ADMIN_PASSWORD) {
    // Generate JWT token with an admin role claim
    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({ token });
  } else {
    return res.status(401).json({ message: 'Invalid password' });
  }
});

app.get('/api/admin/products/sold', authenticateJWT, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.id,
        p.name,
        p.category,
        p.price,
        p.product_condition,
        p.dateAdded,
        u.fullname AS seller_name
      FROM products p
      JOIN users u ON p.sellerId = u.id
      WHERE p.status = 'sold'
      ORDER BY p.dateAdded DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching sold products:', err);
    res.status(500).json({ message: 'Server error fetching sold products' });
  }
});

// Get detailed order info with product name and seller name
app.get('/api/orders/details', authenticateJWT, async (req, res) => {
  const buyerId = req.user.userId;

  try {
    const [orders] = await pool.query(`
      SELECT 
        o.id,
        o.status,
        o.totalPrice,
        o.orderDate,
        p.name AS productName,
        u.fullname AS sellerName
      FROM orders o
      JOIN products p ON o.productId = p.id
      JOIN users u ON p.sellerId = u.id
      WHERE o.buyerId = ?
      ORDER BY o.orderDate DESC
    `, [buyerId]);

    console.log("✅ Detailed orders sent:", orders);
    res.json(orders);
  } catch (err) {
    console.error('Error fetching detailed orders:', err);
    res.status(500).json({ message: 'Error fetching detailed orders' });
  }
});

// ================== START SERVER ===================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
