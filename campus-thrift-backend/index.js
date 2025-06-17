require('dotenv').config();  // Load environment variables
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
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

// Login Route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Missing email or password' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: 'Invalid email or password' });
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
    const values = [
      sellerId,
      name,
      category,
      description,
      price,
      status,
      image,
      product_condition,
      featured === 'true' // convert to boolean
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

// ================== START SERVER ===================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
