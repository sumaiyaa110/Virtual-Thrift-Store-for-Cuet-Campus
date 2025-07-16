let selectedBuyerId = null;
let selectedProductId = null;

// Logout function
function logout() {
  localStorage.removeItem('token');  // Clear the token from localStorage
  window.location.href = "login.html";  // Redirect to login page
}

// Load existing products from localStorage or fetch from backend
let products = JSON.parse(localStorage.getItem('sellerProducts')) || [];

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

// Close sidebar on overlay click or small screen nav
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const mainContent = document.getElementById('mainContent');

  sidebar.classList.remove('show');
  overlay.classList.remove('show');
  mainContent.classList.remove('sidebar-open');
}

// Navigation to sections
function navigateTo(section) {
  // Hide all content sections
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

  // Remove active class from all nav links
  document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));

  // Show target section & highlight nav link
  document.getElementById(section + '-section').classList.add('active');
  document.getElementById('nav-' + section).classList.add('active');

  // Load specific content if needed
  if (section === 'products') {
    loadMyProducts();
  } else if (section === 'messages') {
    loadSellerMessages();
  }
  else if (section === 'profile') loadSellerProfile();

  // Close sidebar on small screens after nav
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

// Image preview on file select
function previewImage(event) {
  const file = event.target.files[0];
  const preview = document.getElementById('imagePreview');

  if (file) {
    const reader = new FileReader();
    reader.onload = e => {
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  }
}

// Product form submission handler
document.getElementById('productForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const token = localStorage.getItem('token');
  if (!token) {
    alert('You need to login first.');
    return;
  }

  const formData = new FormData(this);
  // Add featured flag manually if needed
  formData.append('featured', 'true');

  try {
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Note: No 'Content-Type' header for multipart/form-data
      },
      body: formData
    });

    const data = await response.json();

    alert(data.message);

    if (response.ok) {
      this.reset();
      document.getElementById('imagePreview').style.display = 'none';
      loadMyProducts();
    }
  } catch (error) {
    alert('Error uploading product');
    console.error(error);
  }
});

// Load products for logged-in seller
async function loadMyProducts() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You need to login first.');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const err = await response.json();
      alert(err.message || 'Failed to load products');
      return;
    }

    const data = await response.json();
    products = data;

    const grid = document.getElementById('myProductsGrid');
    grid.innerHTML = '';

    products.forEach(product => {
      const productCard = `
        <div class="product-card">
          <img src="http://localhost:3000${product.image}" alt="${product.name}" class="product-image" onclick="showImageModal('http://localhost:3000${product.image}')">
          <div class="product-info">
            <h3>${product.name}</h3>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Condition:</strong> ${product.product_condition || 'N/A'}</p>
            <p><strong>Added:</strong> ${product.dateAdded || 'N/A'}</p>
            <div class="product-price">৳${product.price}</div>
            <div style="margin: 10px 0;">
              <span class="status-badge status-${product.status}">${product.status}</span>
            </div>
            <p>${product.description}</p>
            <div class="product-actions">
              <button class="btn-remove" onclick="deleteProduct(${product.id})">Delete</button>
            </div>
          </div>
        </div>
      `;
      grid.innerHTML += productCard;
    });

    updateDashboardCounts();

  } catch (error) {
    alert('Failed to load products');
    console.error(error);
  }
}

// Delete product by id
async function deleteProduct(productId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You need to login first.');
    return;
  }

  if (!confirm('Are you sure you want to delete this product?')) return;

  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    alert(data.message);

    if (response.ok) {
      loadMyProducts();
    }
  } catch (error) {
    alert('Error deleting product');
    console.error(error);
  }
}

// Update dashboard product counts
function updateDashboardCounts() {
  document.getElementById('totalProducts').textContent = products.length + ' items';
  document.getElementById('featuredCount').textContent = products.filter(p => p.featured).length + ' items';
}

// Window resize handler to maintain sidebar state
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    if (sidebar.classList.contains('show')) {
      mainContent.classList.add('sidebar-open');
    }
  } else {
    document.getElementById('mainContent').classList.remove('sidebar-open');
  }
});

// Initialize dashboard on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadMyProducts();
  updateDashboardCounts();
});


  // Profile buttons
  document.getElementById('editProfileBtn').addEventListener('click', () => {
    disableProfileInputs(false);
    toggleProfileButtons(true);
  });

  document.getElementById('saveProfileBtn').addEventListener('click', saveProfileChanges);

  document.getElementById('cancelEditBtn').addEventListener('click', cancelEditing);
// Send reply to a message
async function sendSellerReply(messageId) {
  const token = localStorage.getItem('token');
  const replyText = document.getElementById(`reply-${messageId}`).value.trim();

  if (!replyText) {
    alert('Please enter a reply');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/messages/${messageId}/reply`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ reply: replyText })
    });

    const data = await res.json();
    alert(data.message);
    if (res.ok) loadSellerMessages();
  } catch (err) {
    console.error(err);
    alert('Failed to send reply');
  }
}

function showImageModal(imageUrl) {
  const modal = document.getElementById('imageModal');
  const fullImage = document.getElementById('fullImage');
  fullImage.src = imageUrl;
  modal.style.display = 'flex';
}

function closeImageModal(event) {
  // Avoid closing if user clicked on the image itself
  if (event && event.target.tagName === 'IMG') return;
  document.getElementById('imageModal').style.display = 'none';
}

// Parse JWT token helper
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// Global conversations array for seller dashboard
let conversations = [];
let currentConversationId = null;

// Load seller conversations with buyer names included
async function loadSellerMessages() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/chat/conversations', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch conversations');

    conversations = await res.json();

    const convListEl = document.getElementById('conversationsList');
    convListEl.innerHTML = '';

    if (conversations.length === 0) {
      convListEl.innerHTML = '<p>No conversations yet.</p>';
      return;
    }

    // Create clickable list with buyer name and product info
    conversations.forEach(conv => {
      const buyerName = conv.buyer_name || 'Unknown Buyer';
      const convEl = document.createElement('div');
      convEl.classList.add('msg');
      convEl.style.cursor = 'pointer';
      convEl.innerHTML = `
        <strong>Buyer: ${buyerName}</strong><br/>
        <small>Product ID: ${conv.product_id}</small>
      `;
      convEl.onclick = () => loadMessagesForConversation(conv.id);
      convListEl.appendChild(convEl);
    });

  } catch (err) {
    console.error(err);
    alert('Failed to load messages');
  }
}

// Load messages of a selected conversation, showing "You" for seller messages, buyer name otherwise
async function loadMessagesForConversation(conversationId) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login first');
    return;
  }

  const payload = parseJwt(token);
  const sellerId = payload?.id;

  const conv = conversations.find(c => c.id === conversationId);
  const buyerName = conv?.buyer_name || 'Buyer';

  currentConversationId = conversationId;
  selectedBuyerId = conv.buyerId;
  selectedProductId = conv.product_id;

  // Show confirm button
  const confirmBtn = document.getElementById('confirmOrderBtn');
  confirmBtn.style.display = 'inline-block';
  confirmBtn.onclick = confirmOrder;


  const container = document.getElementById('messagesContainer');
  container.innerHTML = '<p>Loading messages...</p>';

  try {
    const res = await fetch(`http://localhost:3000/api/chat/${conversationId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load messages');

    const messages = await res.json();
    container.innerHTML = '';

    messages.forEach(msg => {
      // Determine sender display name
      const from = (msg.sender_id === sellerId) ? 'You' : (msg.sender_name || buyerName);
      const msgEl = document.createElement('div');
      msgEl.className = 'msg';
      msgEl.style.marginBottom = '15px';
      msgEl.innerHTML = `
        <p><strong>${from}</strong></p>
        <p>${msg.message}</p>
        <p><small>${new Date(msg.sentAt).toLocaleString()}</small></p>
      `;
      container.appendChild(msgEl);
    });

    // Add reply box
    container.innerHTML += `
      <textarea id="replyText" placeholder="Type your reply..." style="width: 100%; height: 70px; margin-top: 10px;"></textarea>
      <button onclick="sendReply()" style="margin-top: 5px;" class="btn-primary">Send Reply</button>
    `;

  } catch (err) {
    console.error(err);
    container.innerHTML = '<p>Failed to load messages</p>';
  }
}

// Send reply message in current conversation
async function sendReply() {
  const token = localStorage.getItem('token');
  if (!token) return alert('Please login');

  const message = document.getElementById('replyText').value.trim();
  if (!message) return alert('Please enter a reply');

  try {
    const res = await fetch('http://localhost:3000/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        conversation_id: currentConversationId,
        message: message
      })
    });

    const data = await res.json();
    alert(data.message);

    if (res.ok) {
      document.getElementById('replyText').value = '';
      loadMessagesForConversation(currentConversationId);
      loadSellerMessages();
    }
  } catch (err) {
    console.error(err);
    alert('Failed to send reply');
  }
}

async function loadSellerProfile() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('You need to login first.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/seller/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to load profile');

    const data = await res.json();

    document.getElementById('sellerName').value = data.fullname || '';
    document.getElementById('studentId').value = data.studentId || '';

    // Use the utility to get the department from studentId
    const department = data.studentId ? getDepartmentFromStudentId(data.studentId) : '';
    document.getElementById('department').value = department;

    document.getElementById('phone').value = data.phone || '';
    document.getElementById('email').value = data.email || '';

    disableProfileInputs(true);
    toggleProfileButtons(false);
  } catch (err) {
    console.error(err);
    alert('Error loading seller profile');
  }
}

// Disable or enable profile inputs
function disableProfileInputs(disabled) {
  // email is non-editable
  document.getElementById('email').disabled = true;

  // Editable fields
  document.getElementById('sellerName').disabled = disabled;
  document.getElementById('phone').disabled = disabled;
}

// Toggle visibility of profile action buttons
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

// Save seller profile changes to backend
async function saveProfileChanges() {
  const token = getTokenOrRedirect();
  if (!token) return;

  const updatedProfile = {
    fullname: document.getElementById('sellerName').value.trim(),
    phone: document.getElementById('phone').value.trim(),
    shopName: document.getElementById('shopName').value.trim()
  };

  try {
    const res = await fetch('http://localhost:3000/api/seller/profile', {
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
    alert('Failed to update profile');
  }
}

// Cancel editing - reload profile data
function cancelEditing() {
  loadSellerProfile();
}

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

async function confirmOrder() {
  const token = localStorage.getItem('token');
  if (!token) return alert('Please login');

  if (!selectedBuyerId || !selectedProductId) {
    alert('Missing buyer or product info.');
    return;
  }

  const selectedProduct = products.find(p => p.id === selectedProductId);
  if (!selectedProduct) {
    alert('Product not found.');
    return;
  }

  if (selectedProduct.status === 'sold') {
    alert('This product has already been sold.');
    return;
  }

  const confirm = window.confirm("Are you sure you want to confirm this order for the selected buyer?");
  if (!confirm) return;

  const confirmBtn = document.getElementById('confirmOrderBtn');
  confirmBtn.disabled = true;
  confirmBtn.textContent = 'Confirming...';

  try {
    const res = await fetch('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        buyerId: selectedBuyerId,
        productId: selectedProductId,
        quantity: 1
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert('Order confirmed successfully!');
      loadMyProducts(); // Refresh products to update status
      confirmBtn.style.display = 'none'; // Hide button
    } else {
      alert(data.message || 'Failed to confirm order');
      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Confirm Order';
    }

  } catch (err) {
    console.error(err);
    alert('Failed to confirm order');
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Confirm Order';
  }
}

