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
    mainContent.classList.add('sidebar-open');
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
    document.querySelectorAll('.content-section').forEach(section => {
      section.classList.remove('active');
    });
    newSection.classList.add('active');

    if (section === 'orders') loadOrders();
    else if (section === 'wishlist') loadWishlist();
    else if (section === 'cart') loadCart();
    else if (section === 'products') loadProducts();
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

// Load Products
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
          <img src="${p.image}" alt="${p.name}" class="product-image" />
          <h3>${p.name}</h3>
          <p>৳${p.price}</p>
          <button onclick="addToCart(${p.id})">Add to Cart</button>
          <button onclick="addToWishlist(${p.id})">Add to Wishlist</button>
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

// Load Orders
async function loadOrders() {
  const token = getTokenOrRedirect();
  if (!token) return;

  try {
    const res = await fetch('http://localhost:3000/api/orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch orders');

    const orders = await res.json();
    const container = document.getElementById('ordersList');
    if (!container) {
      console.warn('ordersList container not found. Skipping display.');
      return;
    }

    container.innerHTML = '';
    if (orders.length === 0) container.innerHTML = '<p>No orders yet.</p>';

    orders.forEach(order => {
      container.innerHTML += `
        <div class="order-card">
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Status:</strong> ${order.status}</p>
          <p><strong>Total:</strong> ৳${order.total}</p>
          <p><strong>Date:</strong> ${new Date(order.date).toLocaleString()}</p>
        </div>
      `;
    });
  } catch (err) {
    console.error(err);
    alert(err.message);
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
          <img src="${item.image}" alt="${item.name}" class="product-image" />
          <h3>${item.name}</h3>
          <p>৳${item.price}</p>
          <button onclick="removeFromWishlist(${item.id})">Remove</button>
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
          <img src="${item.image}" alt="${item.name}" class="product-image" />
          <h3>${item.name}</h3>
          <p>৳${item.price}</p>
          <button onclick="removeFromCart(${item.id})">Remove</button>
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

// Load default section
document.addEventListener('DOMContentLoaded', () => {
  navigateTo('products'); // Default
});
