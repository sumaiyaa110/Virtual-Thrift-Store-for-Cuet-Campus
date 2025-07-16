// Logout function
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'login.html';
}

// Sidebar toggle
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const mainContent = document.getElementById('mainContent');

  sidebar.classList.toggle('show');
  overlay.classList.toggle('show');

  if (window.innerWidth > 768) {
    mainContent.classList.toggle('sidebar-open');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const mainContent = document.getElementById('mainContent');

  sidebar.classList.remove('show');
  overlay.classList.remove('show');
  mainContent.classList.remove('sidebar-open');
}

// Navigation function
function navigateTo(section) {
  const currentActive = document.querySelector('.sidebar a.active');
  if (currentActive) currentActive.classList.remove('active');

  const newNav = document.getElementById(`nav-${section}`);
  const newSection = document.getElementById(`${section}-section`);

  if (newNav) newNav.classList.add('active');

  if (newSection) {
    document.querySelectorAll('.content-section').forEach(sec => {
      sec.classList.remove('active');
    });
    newSection.classList.add('active');

    if (section === 'orders') loadOrders();
    else if (section === 'wishlist') loadWishlist();
    else if (section === 'cart') loadCart();
    else if (section === 'products') loadAllProducts();  // Public
    else if (section === 'messages') loadMessages();
    else if (section === 'dashboard') loadDashboard();
  } else {
    console.warn(`Section "${section}-section" not found. Skipping display.`);
  }

  if (window.innerWidth <= 768) closeSidebar();
}

// Token check
function getTokenOrRedirect() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first.');
    window.location.href = 'login.html';
    return null;
  }
  return token;
}

document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
});

// UTIL: Map dept code to name
function getDepartmentFromStudentId(studentId) {
  const deptCode = studentId.slice(2, 4);
  switch (deptCode) {
    case '01': return 'CE';
    case '02': return 'EEE';
    case '03': return 'ME';
    case '04': return 'CSE';
    case '05': return 'URP';
    case '06': return 'ARCHI';
    case '07': return 'PME';
    case '08': return 'ETE';
    case '09': return 'MIE';
    case '10': return 'WRE';
    case '11': return 'BME';
    case '12': return 'MME';
    default: return 'Unknown';
  }
}

// Load all products (public for buyers)
async function loadAllProducts() {
  try {
    const res = await fetch('http://localhost:3000/api/all-products');
    if (!res.ok) throw new Error('Failed to fetch all products');

    const products = await res.json();
    const container = document.getElementById('productsGrid');
    if (!container) {
      console.warn('productsGrid not found. Skipping display.');
      return;
    }

    container.innerHTML = '';

    if (products.length === 0) {
      container.innerHTML = '<p>No products available right now.</p>';
      return;
    }

    products.forEach(p => {
      container.innerHTML += `
        <div class="product-card">
          <img src="http://localhost:3000${p.image}" alt="${p.name}" class="product-image" />
          <h3>${p.name}</h3>
          <p>৳${p.price}</p>
          <p><small>Seller: ${p.seller_name}</small></p>
          <button onclick="addToCart(${p.id})" class="btn-primary">Add to Cart</button>
          <button onclick="addToWishlist(${p.id})" class="btn-primary">Add to Wishlist</button>
          <button onclick="contactSeller(${p.seller_id}, ${p.id})" class="btn-primary">Contact Seller</button>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Load seller's own products (JWT protected - optional)
async function loadProducts() {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/products', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch products');

    const products = await res.json();
    const container = document.getElementById('productsGrid');
    if (!container) {
      console.warn('productsGrid not found. Skipping display.');
      return;
    }

    container.innerHTML = '';

products.forEach(p => {
  container.innerHTML += `
    <div class="product-card">
      <img src="http://localhost:3000${p.image}" alt="${p.name}" class="product-image" />
      <h3>${p.name}</h3>
      <p>৳${p.price}</p>
      <button onclick="addToCart(${p.id})" class="btn-primary">Add to Cart</button>
      <button onclick="addToWishlist(${p.id})" class="btn-primary">Add to Wishlist</button>
    </div>
  `;
});

  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Add to cart
async function addToCart(productId) {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/cart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    });

    const data = await res.json();
    alert(data.message);
    if (res.ok) loadCart();
  } catch (error) {
    console.error(error);
    alert('Failed to add to cart');
  }
}

// Add to wishlist
async function addToWishlist(productId) {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/wishlist', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ productId })
    });

    const data = await res.json();
    alert(data.message);
    if (res.ok) loadWishlist();
  } catch (error) {
    console.error(error);
    alert('Failed to add to wishlist');
  }
}

// Load Orders - fills #allOrders tbody with rows
async function loadOrders() {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
      const res = await fetch('http://localhost:3000/api/orders/details', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
    if (!res.ok) throw new Error('Failed to fetch orders');

    const orders = await res.json();
    console.log("Fetched orders:", orders);

    const container = document.getElementById('allOrders');
    if (!container) {
      console.warn('Container #allOrders not found');
      return;
    }

    container.innerHTML = '';
    if (orders.length === 0) {
      container.innerHTML = `<tr><td colspan="7" style="text-align:center;">No orders yet.</td></tr>`;
      return;
    }

    orders.forEach(order => {
      const statusClass = {
        delivered: 'status-delivered',
        pending: 'status-pending',
        shipped: 'status-shipped',
        cancelled: 'status-cancelled'
      }[order.status.toLowerCase()] || '';

      container.innerHTML += `
        <tr>
          <td>${order.id}</td>
          <td>${order.productName || 'N/A'}</td>
          <td>${order.sellerName || 'N/A'}</td>
          <td>৳${parseFloat(order.totalPrice).toFixed(2)}</td>
          <td>${new Date(order.orderDate).toLocaleDateString()}</td>
          <td><span class="status-badge ${statusClass}">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span></td>
          <td>
            ${order.status.toLowerCase() === 'pending' ? `<button class="btn-remove" onclick="cancelOrder(${order.id})">Cancel</button>` : ''}
          </td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Error loading orders:', err);
    alert('Failed to load orders.');
  }
}

// Cancel Order (for Cancel button in orders table)
async function cancelOrder(orderId) {
  if (!confirm('Are you sure you want to cancel this order?')) return;

  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch(`http://localhost:3000/api/orders/${orderId}`, {
      method: 'PUT', // or 'DELETE' if your API uses delete for cancel
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status: 'cancelled' }) // Adjust as per your API spec
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) loadOrders();
  } catch (err) {
    console.error(err);
    alert('Failed to cancel order');
  }
}

// Load Wishlist
async function loadWishlist() {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/wishlist', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch wishlist');

    const wishlist = await res.json();
    const container = document.getElementById('wishlistGrid');
    if (!container) {
      console.warn('wishlistGrid not found. Skipping display.');
      return;
    }

    container.innerHTML = '';
    if (wishlist.length === 0) container.innerHTML = '<p>Your wishlist is empty.</p>';

    wishlist.forEach(item => {
      container.innerHTML += `
        <div class="product-card">
          <img src="http://localhost:3000${item.image}" alt="${item.name}" class="product-image" />
          <h3>${item.name}</h3>
          <p>৳${item.price}</p>
          <button onclick="removeFromWishlist(${item.id})" class="btn-remove">Remove</button>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Remove from Wishlist
async function removeFromWishlist(productId) {
  const token = getTokenOrRedirect();
  if (!token) return;

  if (!confirm('Remove this item from wishlist?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/wishlist/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    alert(data.message);
    if (res.ok) loadWishlist();
  } catch (error) {
    console.error(error);
    alert('Failed to remove from wishlist');
  }
}

// Load Cart
async function loadCart() {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/cart', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch cart');

    const cart = await res.json();
    const container = document.getElementById('cartGrid');
    if (!container) {
      console.warn('cartGrid not found. Skipping display.');
      return;
    }

    container.innerHTML = '';
    if (cart.length === 0) container.innerHTML = '<p>Your cart is empty.</p>';

    cart.forEach(item => {
      container.innerHTML += `
        <div class="product-card">
          <img src="http://localhost:3000${item.image}" alt="${item.name}" class="product-image" />
          <h3>${item.name}</h3>
          <p>৳${item.price}</p>
          <button onclick="removeFromCart(${item.id})" class="btn-remove">Remove</button>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Remove from Cart
async function removeFromCart(productId) {
  const token = getTokenOrRedirect();
  if (!token) return;

  if (!confirm('Remove this item from cart?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/cart/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    alert(data.message);
    if (res.ok) loadCart();
  } catch (error) {
    console.error(error);
    alert('Failed to remove from cart');
  }
}

// Sidebar resize handling
window.addEventListener('resize', () => {
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  if (window.innerWidth > 768) {
    if (sidebar.classList.contains('show')) {
      mainContent.classList.add('sidebar-open');
    } else {
      mainContent.classList.remove('sidebar-open');
    }
  } else {
    mainContent.classList.remove('sidebar-open');
  }
});

// Load buyer profile data into inputs and localStorage fields
async function loadBuyerProfile() {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/buyer/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load profile');

    const data = await res.json();

    // Fill in profile inputs
    document.getElementById('userName').value = data.fullname || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('phone').value = data.phone || '';
    // Assuming studentId is already extracted in backend and sent
    document.getElementById('studentId').value = data.studentId || '';

    // Set Department based on studentId
    document.getElementById('department').value = getDepartmentFromStudentId(document.getElementById('studentId').value);


    // Disable non-editable fields initially
    disableProfileInputs(true);

    // Set buttons states
    toggleProfileButtons(false);
  } catch (err) {
    console.error(err);
    alert('Error loading profile');
  }
}

// Disable or enable editable inputs (hall, room, phone, name editable)
function disableProfileInputs(disabled) {
  // Always disabled: studentId, email, department
  document.getElementById('studentId').disabled = true;
  document.getElementById('email').disabled = true;
  document.getElementById('department').disabled = true;

  // Editable fields controlled here
  document.getElementById('phone').disabled = disabled;
  document.getElementById('userName').disabled = disabled;
}

// Toggle button visibility and text
function toggleProfileButtons(isEditing) {
  const editBtn = document.getElementById('editProfileBtn');
  const saveBtn = document.getElementById('saveProfileBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');

  if (isEditing) {
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
  } else {
    editBtn.style.display = 'inline-block';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
  }
}

// Save profile changes (name, phone, hall, room locally or to backend as needed)
async function saveProfileChanges() {
  const token = getTokenOrRedirect();
  if (!token) return;

  // Gather values
  const updatedProfile = {
    fullname: document.getElementById('userName').value.trim(),
    phone: document.getElementById('phone').value.trim()
  };

  try {
    // Update profile on backend (only name and phone here)
    const res = await fetch('http://localhost:3000/api/buyer/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updatedProfile)
    });

    const result = await res.json();
    alert(result.message);

    if (res.ok) {
      disableProfileInputs(true);
      toggleProfileButtons(false);
    }
  } catch (err) {
    console.error(err);
    alert('Profile update failed');
  }
}

// Cancel editing - reload values from backend/localStorage
function cancelEditing() {
  loadBuyerProfile();
}

// Event listeners for profile buttons
document.addEventListener('DOMContentLoaded', () => {
  loadBuyerProfile();

  document.getElementById('editProfileBtn').addEventListener('click', () => {
    disableProfileInputs(false);
    toggleProfileButtons(true);
  });

  document.getElementById('saveProfileBtn').addEventListener('click', saveProfileChanges);

  document.getElementById('cancelEditBtn').addEventListener('click', cancelEditing);
});

async function loadDashboard() {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/buyer/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to fetch dashboard data');

    const data = await res.json();

    // Update stats
    document.getElementById('totalOrders').textContent = data.totalOrders;
    document.getElementById('wishlistCount').textContent = data.wishlistCount;
    document.getElementById('cartCount').textContent = data.cartCount;

    // Update recent orders table
    const container = document.getElementById('recentOrders');
    container.innerHTML = '';

    if (data.recentOrders.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="text-align:center;">No recent orders</td></tr>`;
    } else {
      data.recentOrders.forEach(order => {
        const statusClass = {
          delivered: 'status-delivered',
          shipped: 'status-shipped',
          pending: 'status-pending',
          cancelled: 'status-cancelled'
        }[order.status.toLowerCase()] || '';

        container.innerHTML += `
          <tr>
            <td>${order.productName}</td>
            <td>${order.sellerName}</td>
            <td>৳${order.price}</td>
            <td>${new Date(order.orderDate).toLocaleDateString()}</td>
            <td><span class="status-badge ${statusClass}">${order.status}</span></td>
          </tr>
        `;
      });
    }
  } catch (err) {
    console.error(err);
    alert('Failed to load dashboard');
  }
}

function getUserIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id; // adjust based on your token payload key
  } catch {
    return null;
  }
}

async function loadConversationMessages(conversationId) {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch(`http://localhost:3000/api/chat/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to load conversation messages');

    const messages = await res.json();

    const container = document.getElementById('messagesContainer');
    if (!container) return;

    container.innerHTML = '';

    if (messages.length === 0) {
      container.innerHTML = '<p style="text-align:center;">No messages in this conversation yet.</p>';
      return;
    }

    messages.forEach(msg => {
      const date = new Date(msg.sent_at || msg.sentAt).toLocaleString();
      const senderName = msg.sender_name || msg.senderName || 'Unknown';

      container.innerHTML += `
        <div class="message-card">
          <p><strong>${senderName}:</strong> ${msg.message}</p>
          <p class="msg-time"><small><em>${date}</em></small></p>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    alert('Failed to load conversation messages');
  }
}


// ===== UPDATED Chat-related functions =====

// Load all chat conversations for logged-in buyer
async function loadMessages() {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/chat/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('API Error:', res.status, errorText);
      throw new Error(`Failed to fetch conversations (${res.status})`);
    }

    const conversations = await res.json();
    const container = document.getElementById('messagesContainer');
    if (!container) {
      console.error('Messages container not found.');
      return;
    }

    container.innerHTML = '';

    if (conversations.length === 0) {
      container.innerHTML = '<p style="text-align:center;">No conversations found.</p>';
      return;
    }

    conversations.forEach(conv => {
      const startedDate = new Date(conv.created_at || conv.createdAt).toLocaleString();
      const sellerName = conv.seller_name || conv.sellerName || 'Unknown Seller';

      container.innerHTML += `
        <div class="conversation-card" onclick="openChatModal(${conv.id})" style="cursor:pointer; border:1px solid #ccc; margin:8px; padding:8px; border-radius:4px;">
          <p><strong>Seller:</strong> ${sellerName}</p>
          <p><small>Started: ${startedDate}</small></p>
        </div>
      `;
    });
  } catch (err) {
    console.error('Error in loadMessages:', err);
    alert(`Failed to load conversations: ${err.message}`);
  }
}

// Open chat modal and load messages for a conversation
async function openChatModal(conversationId) {
  const token = getTokenOrRedirect();
  if (!token) return;

  const modal = document.getElementById('chatModal');
  const chatMessages = document.getElementById('chatMessages');
  const sendMsgBtn = document.getElementById('sendMsgBtn');

  if (!modal || !chatMessages || !sendMsgBtn) {
    alert('Chat modal or elements missing in HTML.');
    return;
  }

  modal.style.display = 'block';
  chatMessages.innerHTML = '';
  sendMsgBtn.onclick = () => sendMessage(conversationId);

  try {
    const res = await fetch(`http://localhost:3000/api/chat/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to load conversation messages');

    const messages = await res.json();

    chatMessages.innerHTML = '';
    messages.forEach(msg => {
      const div = document.createElement('div');
      div.className = msg.sender_id === getUserIdFromToken(token) ? 'message right' : 'message left';
      div.textContent = `${msg.sender_name}: ${msg.message}`;
      chatMessages.appendChild(div);
    });

    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (err) {
    console.error('Failed to load messages:', err);
    alert('Could not load messages');
  }
}

// Send a chat message
async function sendMessage(conversationId) {
  const token = getTokenOrRedirect();
  if (!token) return;

  const input = document.getElementById('messageInput');
  if (!input) return;

  const message = input.value.trim();
  if (!message) return;

  try {
    const res = await fetch('http://localhost:3000/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ conversation_id: conversationId, message })
    });

    if (!res.ok) throw new Error('Failed to send message');

    input.value = '';
    await openChatModal(conversationId); // Reload messages after sending
  } catch (err) {
    console.error('Message sending error:', err);
    alert('Failed to send message');
  }
}

// Contact seller from product card button (starts or gets conversation)
async function contactSeller(sellerId, productId = null) {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const tokenPayload = JSON.parse(atob(token.split('.')[1]));
    const buyerId = tokenPayload.userId || tokenPayload.id;

    const res = await fetch('http://localhost:3000/api/chat/conversation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ buyerId, sellerId, product_id: productId })
    });

    if (!res.ok) throw new Error('Failed to contact seller');

    const conversation = await res.json();
    openChatModal(conversation.id);
  } catch (err) {
    console.error('Error contacting seller:', err);
    alert('Failed to contact seller');
  }
}

// Close chat modal function (you should create a close button in HTML to call this)
function closeChatModal() {
  const modal = document.getElementById('chatModal');
  if (modal) modal.style.display = 'none';
}

// Open image modal when clicking product image
function setupProductImageModal() {
  const productsGrid = document.getElementById('productsGrid');
  const imageModal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');
  const closeBtn = document.getElementById('imageModalClose');

  // Delegate click to images inside productsGrid
  productsGrid.addEventListener('click', function(event) {
    if (event.target.tagName === 'IMG' && event.target.classList.contains('product-image')) {
      modalImage.src = event.target.src;
      imageModal.style.display = 'flex';
    }
  });

  closeBtn.addEventListener('click', () => {
    imageModal.style.display = 'none';
    modalImage.src = '';
  });

  // Optional: close modal on clicking outside the image
  imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) {
      imageModal.style.display = 'none';
      modalImage.src = '';
    }
  });
}

// Call this function after loading all products into #productsGrid
setupProductImageModal();
