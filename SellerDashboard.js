// Logout function
function logout() {
  localStorage.removeItem('token');  // Clear the token from localStorage
  window.location.href = "login.html";  // Redirect to login page
}

// Load existing products from localStorage or fetch from backend
let products = JSON.parse(localStorage.getItem('sellerProducts')) || [];

// Function to save products to localStorage
function saveProductsToStorage() {
  localStorage.setItem('sellerProducts', JSON.stringify(products));

  // Also update featured products for the featured page
  const featuredProducts = products.filter(p => p.featured).map(p => ({
    ...p,
    views: p.views || 0
  }));
  localStorage.setItem('featuredProducts', JSON.stringify(featuredProducts));
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
  }

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
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-info">
            <h3>${product.name}</h3>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Condition:</strong> ${product.product_condition || 'N/A'}</p>
            <p><strong>Added:</strong> ${product.dateAdded || 'N/A'}</p>
            <div class="product-price">৳${product.price}</div>
            <div style="margin: 10px 0;">
              <span class="status-badge status-${product.status}">${product.status}</span>
              ${product.featured ? '<span class="status-badge status-featured">Featured</span>' : ''}
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
