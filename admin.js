let sidebarOpen = false;

// Toggle Sidebar
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('mainContent');
  const overlay = document.getElementById('sidebarOverlay');
  sidebarOpen = !sidebarOpen;

  if (sidebarOpen) {
    sidebar.classList.add('show');
    overlay.classList.add('show');
    if (window.innerWidth > 768) main.classList.add('sidebar-open');
  } else {
    sidebar.classList.remove('show');
    overlay.classList.remove('show');
    main.classList.remove('sidebar-open');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('mainContent');
  const overlay = document.getElementById('sidebarOverlay');

  sidebarOpen = false;
  sidebar.classList.remove('show');
  overlay.classList.remove('show');
  main.classList.remove('sidebar-open');
}

function navigateTo(section) {
  document.querySelectorAll('.sidebar a').forEach(link => link.classList.remove('active'));
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

  document.getElementById(`nav-${section}`).classList.add('active');
  document.getElementById(`${section}-section`).classList.add('active');

  loadSectionData(section);

  if (window.innerWidth <= 768) closeSidebar();
}

function loadSectionData(section) {
  switch (section) {
    case 'buyers': populateBuyersTable(); break;
    case 'sellers': populateSellersTable(); break;
    case 'products': populateProductsTable(); break;
    case 'sold': populateAllSoldItems(); break;
    case 'messages': populateAllMessages(); break;
  }
}

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

// Populate Buyers Table
async function populateBuyersTable() {
  const table = document.getElementById('buyersTable');
  table.innerHTML = '';

  try {
    const res = await fetch('http://localhost:3000/api/admin/buyers');
    if (!res.ok) throw new Error('Failed to fetch buyers');
    const buyers = await res.json();

    buyers.forEach(buyer => {
      const emailPrefix = buyer.email.split('@')[0];
      const studentId = emailPrefix.startsWith('u') ? emailPrefix.slice(1) : 'N/A';
      const dept = getDepartmentFromStudentId(studentId);
      const joinDate = new Date(buyer.created_at).toISOString().split('T')[0];
      const status = 'active';
      const statusClass = 'status-active';

      table.innerHTML += `
        <tr>
          <td>${buyer.fullname}</td>
          <td>${studentId}</td>
          <td>${dept}</td>
          <td>${joinDate}</td>
          <td><span class="status-badge ${statusClass}">${status}</span></td>
          <td><button class="btn-remove" onclick="removeBuyer(${buyer.id})">Remove</button></td>
        </tr>
      `;
    });
  } catch (err) {
    table.innerHTML = `<tr><td colspan="6">Error loading buyers</td></tr>`;
    console.error('Failed to load buyers:', err);
  }
}

async function removeBuyer(id) {
  if (!confirm('Are you sure you want to remove this buyer?')) return;
  try {
    const res = await fetch(`http://localhost:3000/api/admin/user/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      alert('Buyer removed successfully.');
      populateBuyersTable();
    } else {
      alert('Failed to remove buyer.');
    }
  } catch (err) {
    alert('Error removing buyer.');
    console.error(err);
  }
}

// Populate Sellers Table
async function populateSellersTable() {
  const table = document.getElementById('sellersTable');
  table.innerHTML = '';

  try {
    const res = await fetch('http://localhost:3000/api/admin/sellers');
    if (!res.ok) throw new Error('Failed to fetch sellers');
    const sellers = await res.json();

    for (const seller of sellers) {
      const emailPrefix = seller.email.split('@')[0];
      const studentId = emailPrefix.startsWith('u') ? emailPrefix.slice(1) : 'N/A';
      const dept = getDepartmentFromStudentId(studentId);
      const joinDate = new Date(seller.created_at).toISOString().split('T')[0];
      const status = 'active';
      const statusClass = 'status-active';

      // Fetch counts of listed and sold products for seller
      const [listedCount, soldCount] = await Promise.all([
        fetch(`http://localhost:3000/api/admin/seller/${seller.id}/products-count`).then(r => r.ok ? r.json() : { count: 0 }),
        fetch(`http://localhost:3000/api/admin/seller/${seller.id}/sold-count`).then(r => r.ok ? r.json() : { count: 0 }),
      ]);

      table.innerHTML += `
        <tr>
          <td>${seller.fullname}</td>
          <td>${studentId}</td>
          <td>${dept}</td>
          <td>${listedCount.count ?? 0}</td>
          <td>${soldCount.count ?? 0}</td>
          <td><span class="status-badge ${statusClass}">${status}</span></td>
          <td><button class="btn-remove" onclick="removeSeller(${seller.id})">Remove</button></td>
        </tr>
      `;
    }
  } catch (err) {
    table.innerHTML = `<tr><td colspan="7">Error loading sellers</td></tr>`;
    console.error('Failed to load sellers:', err);
  }
}

async function removeSeller(id) {
  if (!confirm('Are you sure you want to remove this seller?')) return;
  try {
    const res = await fetch(`http://localhost:3000/api/admin/seller/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) {
      alert('Seller removed successfully.');
      populateSellersTable();
    } else {
      alert('Failed to remove seller.');
    }
  } catch (err) {
    alert('Error removing seller.');
    console.error(err);
  }
}

// Populate Products Table (placeholder)
async function populateProductsTable() {
  const table = document.getElementById('productsTable');
  table.innerHTML = '';

  try {
    const res = await fetch('http://localhost:3000/api/all-products');
    if (!res.ok) throw new Error('Failed to fetch products');
    const products = await res.json();

    if (products.length === 0) {
      table.innerHTML = '<tr><td colspan="7" style="text-align:center;">No products found.</td></tr>';
      return;
    }

    products.forEach(product => {
      const postedDate = product.dateAdded
        ? new Date(product.dateAdded).toISOString().split('T')[0]
        : 'N/A';

      const statusValue = product.status || 'pending'; // Default to pending if null

      table.innerHTML += `
        <tr>
          <td>${product.name}</td>
          <td>${product.category}</td>
          <td>${product.price}</td>
          <td>${product.seller_name || 'N/A'}</td>
          <td>${postedDate}</td>
          <td>
            <select onchange="updateProductStatus(${product.id}, this.value)">
              <option value="pending" ${statusValue === 'pending' ? 'selected' : ''}>pending</option>
              <option value="active" ${statusValue === 'active' ? 'selected' : ''}>active</option>
              <option value="sold" ${statusValue === 'sold' ? 'selected' : ''}>sold</option>
            </select>
          </td>
          <td><button class="btn-remove" onclick="removeProduct(${product.id})">Remove</button></td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Failed to load products:', err);
    table.innerHTML = `<tr><td colspan="7">Error loading products</td></tr>`;
  }
}

async function removeProduct(productId) {
  if (!confirm('Are you sure you want to remove this product?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/products/${productId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('adminToken') } // or adjust token management accordingly
    });

    if (res.ok) {
      alert('Product removed successfully.');
      populateProductsTable();
    } else {
      alert('Failed to remove product.');
    }
  } catch (err) {
    alert('Error removing product.');
    console.error(err);
  }
}

// Populate Sold Items Table (demo data)
async function populateAllSoldItems() {
  const table = document.getElementById('allSoldItems');
  table.innerHTML = '';

  try {
    const res = await fetch('http://localhost:3000/api/admin/products/sold', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    if (!res.ok) throw new Error('Failed to fetch sold products');

    const soldProducts = await res.json();

    if (soldProducts.length === 0) {
      table.innerHTML = '<tr><td colspan="6" style="text-align:center;">No sold products found.</td></tr>';
      return;
    }

    soldProducts.forEach(item => {
      const dateAdded = item.dateAdded ? new Date(item.dateAdded).toISOString().split('T')[0] : 'N/A';
      table.innerHTML += `
        <tr>
          <td>${item.name}</td>
          <td>${item.category}</td>
          <td>৳${item.price}</td>
          <td>${item.seller_name}</td>
          <td>${dateAdded}</td>
          <td>${item.product_condition}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Failed to load sold products:', err);
    table.innerHTML = '<tr><td colspan="6">Error loading sold products</td></tr>';
  }
}

// Populate Messages Box (demo data)
function populateAllMessages() {
  const messages = [
    { sender: "Sabbir Ahmed", content: "Can I update my posted item description?", time: "2 hours ago" },
    { sender: "Afia Rahman", content: "Where should I meet the buyer for item exchange?", time: "3 hours ago" },
    { sender: "Mithun Khan", content: "Having trouble logging into my account.", time: "5 hours ago" },
  ];
  const msgBox = document.getElementById('allMessages');
  msgBox.innerHTML = '';
  messages.forEach(msg => {
    msgBox.innerHTML += `
      <div class="msg">
        <strong>${msg.sender}:</strong> ${msg.content}
        <div style="font-size: 12px; color: #666; margin-top: 5px;">${msg.time}</div>
      </div>
    `;
  });
}

// Click outside sidebar closes it (mobile)
document.addEventListener('click', function (e) {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.querySelector('.menu-toggle');
  if (sidebarOpen && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
    if (window.innerWidth <= 768) closeSidebar();
  }
});

// Responsive handling of sidebar
window.addEventListener('resize', function () {
  const main = document.getElementById('mainContent');
  if (window.innerWidth > 768 && sidebarOpen) {
    main.classList.add('sidebar-open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  } else if (window.innerWidth <= 768) {
    main.classList.remove('sidebar-open');
    if (sidebarOpen) document.getElementById('sidebarOverlay').classList.add('show');
  }
});

// On page load, animate cards and load default section
document.addEventListener('DOMContentLoaded', function () {
  // Animate cards
  document.querySelectorAll('.card').forEach((card, i) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    setTimeout(() => {
      card.style.transition = 'all 0.5s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, i * 200);
  });

  // Load dynamic dashboard data
  loadDashboardStats();
  loadTodaySoldItems();
  loadRecentMessages();
  loadChatbotMessages();
});

// Fetch and populate dashboard top stats
async function loadDashboardStats() {
  try {
    const res = await fetch('http://localhost:3000/api/admin/stats');
    if (!res.ok) throw new Error('Failed to load stats');
    const data = await res.json();

    document.getElementById('soldToday').textContent = `${data.soldToday} items`;
    document.getElementById('addedToday').textContent = `${data.addedToday} items`;
    document.getElementById('messageCount').textContent = `${data.messageCount} messages`;
  } catch (err) {
    console.error('Dashboard stats error:', err);
    document.getElementById('soldToday').textContent = 'N/A';
    document.getElementById('addedToday').textContent = 'N/A';
    document.getElementById('messageCount').textContent = 'N/A';
  }
}

// Fetch and populate today's sold items table
async function loadTodaySoldItems() {
  const soldTable = document.getElementById('soldItems');
  soldTable.innerHTML = '';
  try {
    const res = await fetch('http://localhost:3000/api/admin/sold-today');
    if (!res.ok) throw new Error('Failed to fetch today\'s sold items');
    const items = await res.json();

    if (items.length === 0) {
      soldTable.innerHTML = '<tr><td colspan="4" style="text-align:center;">No sales today.</td></tr>';
      return;
    }

    items.forEach(item => {
      soldTable.innerHTML += `
        <tr>
          <td>${item.productName}</td>
          <td>${item.sellerName}</td>
          <td>${item.buyerName}</td>
          <td>${new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
        </tr>
      `;
    });
  } catch (err) {
    console.error('Sold today fetch error:', err);
    soldTable.innerHTML = '<tr><td colspan="4">Error loading sold items.</td></tr>';
  }
}

// Fetch and populate recent messages box
async function loadRecentMessages() {
  const msgBox = document.getElementById('messages');
  msgBox.innerHTML = '';
  try {
    const res = await fetch('http://localhost:3000/api/admin/recent-messages');
    if (!res.ok) throw new Error('Failed to fetch messages');
    const messages = await res.json();

    if (messages.length === 0) {
      msgBox.innerHTML = '<div class="msg">No recent messages.</div>';
      return;
    }

    messages.forEach(msg => {
      msgBox.innerHTML += `
        <div class="msg">
          <strong>${msg.user}:</strong> ${msg.text}
        </div>
      `;
    });
  } catch (err) {
    console.error('Messages load error:', err);
    msgBox.innerHTML = '<div class="msg">Error loading messages.</div>';
  }
}

async function updateProductStatus(productId, newStatus) {
  try {
    const res = await fetch(`http://localhost:3000/api/admin/products/${productId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });

    if (!res.ok) throw new Error('Status update failed');
    console.log(`Product ${productId} status updated to ${newStatus}`);
  } catch (err) {
    alert('Failed to update status');
    console.error(err);
  }
}

async function loadChatbotMessages() {
  const container = document.getElementById('adminMessages');
  const endpoint = 'http://localhost:3000/api/admin/chatbot-messages'; // your chatbot messages API

  try {
    const res = await fetch(endpoint, {
      headers: { Authorization: 'Bearer ' + localStorage.getItem('adminToken') } // Adjust your auth if needed
    });
    if (!res.ok) throw new Error('Failed to fetch chatbot messages');
    const messages = await res.json();

    if (!messages.length) {
      container.innerHTML = '<p>No chatbot conversations yet.</p>';
      return;
    }

    container.innerHTML = messages.map(msg => `
      <div class="msg">
        <strong>${escapeHtml(msg.sender)}</strong>
        <span style="float:right; font-size:12px; color:#555;">
          ${new Date(msg.timestamp).toLocaleString()}
        </span>
        <p>${escapeHtml(msg.content)}</p>
      </div>
    `).join('');
  } catch (err) {
    console.error('Chatbot messages error:', err);
    container.innerHTML = '<p style="color:red;">Failed to load chatbot messages.</p>';
  }
}

// Utility: simple escape HTML for safety
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}
