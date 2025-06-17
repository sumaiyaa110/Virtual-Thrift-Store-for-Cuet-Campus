let sidebarOpen = false;

// Sample data
const data = {
  buyers: [
    { name: "Mitu Rahman", id: "190204056", dept: "CSE", joinDate: "2024-12-15", status: "active" },
    { name: "Ahnaf Khan", id: "190204078", dept: "EEE", joinDate: "2024-12-10", status: "active" },
    { name: "Adil Ahmed", id: "190204099", dept: "CE", joinDate: "2024-12-08", status: "active" },
    { name: "Fahim Hasan", id: "190204012", dept: "ME", joinDate: "2024-12-05", status: "pending" },
    { name: "Ruma Khatun", id: "190204033", dept: "CSE", joinDate: "2024-12-01", status: "active" }
  ],
  sellers: [
    { name: "Rakib Islam", id: "190204001", dept: "CSE", listed: 3, sold: 2, status: "active" },
    { name: "Shakil Ahmed", id: "190204023", dept: "EEE", listed: 2, sold: 1, status: "active" },
    { name: "Tanha Sultana", id: "190204045", dept: "CE", listed: 4, sold: 3, status: "active" },
    { name: "Nadia Khan", id: "190204067", dept: "ME", listed: 1, sold: 1, status: "active" },
    { name: "Habib Rahman", id: "190204089", dept: "CSE", listed: 2, sold: 1, status: "pending" }
  ],
  products: [
    { name: "Scientific Calculator", id:"1", category: "Electronics", price: 1200, seller: "Rakib Islam", date: "2024-12-20", status: "available" },
    { name: "Engineering Textbook",id:"2", category: "Books", price: 800, seller: "Shakil Ahmed", date: "2024-12-19", status: "sold" },
    { name: "Laptop Bag",id:"3", category: "Accessories", price: 500, seller: "Tanha Sultana", date: "2024-12-18", status: "available" },
    { name: "Study Table",id:"4", category: "Furniture", price: 2500, seller: "Nadia Khan", date: "2024-12-17", status: "pending" },
    { name: "Mobile Phone",id:"5", category: "Electronics", price: 8000, seller: "Habib Rahman", date: "2024-12-16", status: "available" },
    { name: "Desk Lamp",id:"6", category: "Electronics", price: 350, seller: "Rakib Islam", date: "2024-12-15", status: "sold" }
  ],
  soldItems: [
    { product: "Desk Lamp", price: 350, seller: "Rakib", buyer: "Mitu", date: "2024-12-20 10:15 AM" },
    { product: "Math Book", price: 600, seller: "Shakil", buyer: "Asif", date: "2024-12-20 11:00 AM" },
    { product: "Backpack", price: 800, seller: "Tanha", buyer: "Adil", date: "2024-12-20 01:30 PM" },
    { product: "Calculator", price: 1200, seller: "Nadia", buyer: "Fahim", date: "2024-12-20 02:45 PM" },
    { product: "Notebook Set", price: 150, seller: "Habib", buyer: "Ruma", date: "2024-12-20 03:20 PM" }
  ],
  messages: [
    { sender: "Sabbir Ahmed", content: "Can I update my posted item description?", time: "2 hours ago" },
    { sender: "Afia Rahman", content: "Where should I meet the buyer for item exchange?", time: "3 hours ago" },
    { sender: "Mithun Khan", content: "Having trouble logging into my account.", time: "5 hours ago" },
    { sender: "Rashida Begum", content: "Need payment confirmation for my recent purchase.", time: "1 day ago" },
    { sender: "Kamal Hossain", content: "How can I delete my old listing?", time: "1 day ago" },
    { sender: "Fatema Khatun", content: "Is there any delivery service available?", time: "2 days ago" }
  ]
};

let currentBuyerPage = 1, currentSellerPage = 1, currentProductPage = 1;
const itemsPerPage = 10;

let buyerSort = { key: 'name', direction: 'asc', type: 'string' };
let sellerSort = { key: 'name', direction: 'asc', type: 'string' };
let productSort = { key: 'name', direction: 'asc', type: 'string' };

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.getElementById('mainContent');
  const overlay = document.getElementById('sidebarOverlay');
  
  sidebarOpen = !sidebarOpen;
  
  if (sidebarOpen) {
    sidebar.classList.add('show');
    overlay.classList.add('show');
    if (window.innerWidth > 768) {
      main.classList.add('sidebar-open');
    }
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
  // Remove active class from all nav links and sections
  document.querySelectorAll('.sidebar a').forEach(link => {
    link.classList.remove('active');
  });
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
  });
  
  // Add active class to clicked link and corresponding section
  document.getElementById(`nav-${section}`).classList.add('active');
  document.getElementById(`${section}-section`).classList.add('active');
  
  // Load section-specific data
  loadSectionData(section);
  
  // Close sidebar on mobile after navigation
  if (window.innerWidth <= 768) {
    closeSidebar();
  }
}

function loadSectionData(section) {
  switch(section) {
    case 'buyers':
      currentBuyerPage = 1;
      buyerSort = { key: 'name', direction: 'asc', type: 'string' };
      document.getElementById('buyerSearch').value = '';
      populateBuyersTable();
      break;
    case 'sellers':
      currentSellerPage = 1;
      sellerSort = { key: 'name', direction: 'asc', type: 'string' };
      document.getElementById('sellerSearch').value = '';
      populateSellersTable();
      break;
    case 'products':
      currentProductPage = 1;
      productSort = { key: 'name', direction: 'asc', type: 'string' };
      document.getElementById('productSearch').value = '';
      populateProductsTable();
      break;
    case 'sold':
      populateAllSoldItems();
      break;
    case 'messages':
      populateAllMessages();
      break;
  }
}

// Helpers for sorting
function sortData(dataArray, key, direction, type) {
  return dataArray.slice().sort((a, b) => {
    let valA = a[key];
    let valB = b[key];
    if(type === 'number') {
      valA = Number(valA);
      valB = Number(valB);
    } else if(type === 'date') {
      valA = new Date(valA);
      valB = new Date(valB);
    } else {
      valA = valA.toString().toLowerCase();
      valB = valB.toString().toLowerCase();
    }
    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// Pagination rendering
function renderPagination(totalItems, currentPage, paginationContainerId, onPageChange) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const container = document.getElementById(paginationContainerId);
  container.innerHTML = '';

  if(totalPages <= 1) return;

  for(let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    if(i === currentPage) btn.classList.add('active');
    btn.addEventListener('click', () => onPageChange(i));
    container.appendChild(btn);
  }
}

// Remove functions with confirmation
function removeBuyer(id) {
  if (confirm('Are you sure you want to remove this buyer?')) {
    data.buyers = data.buyers.filter(b => b.id !== id.toString());
    if ((currentBuyerPage-1)*itemsPerPage >= data.buyers.length && currentBuyerPage > 1) currentBuyerPage--;
    populateBuyersTable();
  }
}

function removeSeller(id) {
  if (confirm('Are you sure you want to remove this seller?')) {
    data.sellers = data.sellers.filter(s => s.id !== id.toString());
    if ((currentSellerPage-1)*itemsPerPage >= data.sellers.length && currentSellerPage > 1) currentSellerPage--;
    populateSellersTable();
  }
}

function removeProduct(id) {
  if (confirm('Are you sure you want to remove this product?')) {
    data.products = data.products.filter(p => p.id !== id.toString());
    if ((currentProductPage-1)*itemsPerPage >= data.products.length && currentProductPage > 1) currentProductPage--;
    populateProductsTable();
  }
}

// Populate Buyers Table with filtering, sorting, and pagination
function populateBuyersTable() {
  const searchInput = document.getElementById('buyerSearch').value.toLowerCase();
  let list = data.buyers;
  if(searchInput) {
    list = list.filter(b => b.name.toLowerCase().includes(searchInput) || b.id.toLowerCase().includes(searchInput));
  }

  list = sortData(list, buyerSort.key, buyerSort.direction, buyerSort.type);

  const table = document.getElementById('buyersTable');
  table.innerHTML = '';

  const start = (currentBuyerPage-1)*itemsPerPage;
  const pagedData = list.slice(start, start + itemsPerPage);

  pagedData.forEach(buyer => {
    const statusClass = buyer.status === 'active' ? 'status-active' : 'status-pending';
    table.innerHTML += `
      <tr>
        <td>${buyer.name}</td>
        <td>${buyer.id}</td>
        <td>${buyer.dept}</td>
        <td>${buyer.joinDate}</td>
        <td><span class="status-badge ${statusClass}">${buyer.status}</span></td>
        <td><button class="btn-remove" onclick="removeBuyer('${buyer.id}')">Remove</button></td>
      </tr>
    `;
  });

  renderPagination(list.length, currentBuyerPage, 'buyersPagination', (page) => {
    currentBuyerPage = page;
    populateBuyersTable();
  });
}

// Populate Sellers Table with filtering, sorting, and pagination
function populateSellersTable() {
  const searchInput = document.getElementById('sellerSearch').value.toLowerCase();
  let list = data.sellers;
  if(searchInput) {
    list = list.filter(s => s.name.toLowerCase().includes(searchInput) || s.id.toLowerCase().includes(searchInput));
  }

  list = sortData(list, sellerSort.key, sellerSort.direction, sellerSort.type);

  const table = document.getElementById('sellersTable');
  table.innerHTML = '';

  const start = (currentSellerPage-1)*itemsPerPage;
  const pagedData = list.slice(start, start + itemsPerPage);

  pagedData.forEach(seller => {
    const statusClass = seller.status === 'active' ? 'status-active' : 'status-pending';
    table.innerHTML += `
      <tr>
        <td>${seller.name}</td>
        <td>${seller.id}</td>
        <td>${seller.dept}</td>
        <td>${seller.listed}</td>
        <td>${seller.sold}</td>
        <td><span class="status-badge ${statusClass}">${seller.status}</span></td>
        <td><button class="btn-remove" onclick="removeSeller('${seller.id}')">Remove</button></td>
      </tr>
    `;
  });

  renderPagination(list.length, currentSellerPage, 'sellersPagination', (page) => {
    currentSellerPage = page;
    populateSellersTable();
  });
}

// Populate Products Table with filtering, sorting, and pagination
function populateProductsTable() {
  const searchInput = document.getElementById('productSearch').value.toLowerCase();
  let list = data.products;
  if(searchInput) {
    list = list.filter(p => p.name.toLowerCase().includes(searchInput) || p.category.toLowerCase().includes(searchInput));
  }

  list = sortData(list, productSort.key, productSort.direction, productSort.type);

  const table = document.getElementById('productsTable');
  table.innerHTML = '';

  const start = (currentProductPage-1)*itemsPerPage;
  const pagedData = list.slice(start, start + itemsPerPage);

  pagedData.forEach(product => {
    let statusClass = 'status-active';
    if (product.status === 'sold') statusClass = 'status-sold';
    else if (product.status === 'pending') statusClass = 'status-pending';

    table.innerHTML += `
      <tr>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>৳${product.price}</td>
        <td>${product.seller}</td>
        <td>${product.date}</td>
        <td><span class="status-badge ${statusClass}">${product.status}</span></td>
        <td><button class="btn-remove" onclick="removeProduct('${product.id}')">Remove</button></td>
      </tr>
    `;
  });

  renderPagination(list.length, currentProductPage, 'productsPagination', (page) => {
    currentProductPage = page;
    populateProductsTable();
  });
}

// Populate Sold Items (no pagination needed for demo)
function populateAllSoldItems() {
  const table = document.getElementById('allSoldItems');
  table.innerHTML = '';
  data.soldItems.forEach(item => {
    table.innerHTML += `
      <tr>
        <td>${item.product}</td>
        <td>৳${item.price}</td>
        <td>${item.seller}</td>
        <td>${item.buyer}</td>
        <td>${item.date}</td>
      </tr>
    `;
  });
}

// Populate Messages (no pagination needed for demo)
function populateAllMessages() {
  const msgBox = document.getElementById('allMessages');
  msgBox.innerHTML = '';
  data.messages.forEach(msg => {
    msgBox.innerHTML += `
      <div class="msg">
        <strong>${msg.sender}:</strong> ${msg.content}
        <div style="font-size: 12px; color: #666; margin-top: 5px;">${msg.time}</div>
      </div>
    `;
  });
}

// Sorting headers click event handler
function setupSorting(tableId, sortObj, populateFunc) {
  const table = document.getElementById(tableId);
  const headers = table.querySelectorAll('thead th.sortable');
  headers.forEach(header => {
    header.addEventListener('click', () => {
      const key = header.getAttribute('data-key');
      const type = header.getAttribute('data-type');
      if(sortObj.key === key) {
        sortObj.direction = sortObj.direction === 'asc' ? 'desc' : 'asc';
      } else {
        sortObj.key = key;
        sortObj.direction = 'asc';
        sortObj.type = type;
      }
      populateFunc();
    });
  });
}

// Event Listeners for search inputs
document.getElementById('buyerSearch').addEventListener('input', () => {
  currentBuyerPage = 1;
  populateBuyersTable();
});

document.getElementById('sellerSearch').addEventListener('input', () => {
  currentSellerPage = 1;
  populateSellersTable();
});

document.getElementById('productSearch').addEventListener('input', () => {
  currentProductPage = 1;
  populateProductsTable();
});

// Close sidebar when clicking outside on mobile
document.addEventListener('click', function(event) {
  const sidebar = document.getElementById('sidebar');
  const menuToggle = document.querySelector('.menu-toggle');
  
  if (sidebarOpen && !sidebar.contains(event.target) && !menuToggle.contains(event.target)) {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  }
});

// Handle window resize
window.addEventListener('resize', function() {
  if (window.innerWidth > 768 && sidebarOpen) {
    document.getElementById('mainContent').classList.add('sidebar-open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  } else if (window.innerWidth <= 768) {
    document.getElementById('mainContent').classList.remove('sidebar-open');
    if (sidebarOpen) {
      document.getElementById('sidebarOverlay').classList.add('show');
    }
  }
});

// Initialize dashboard data & sorting on page load
document.addEventListener('DOMContentLoaded', function() {
  // Populate dashboard sold items
  const soldTable = document.getElementById('soldItems');
  const todaysSoldItems = [
    { product: "Desk Lamp", seller: "Rakib", buyer: "Mitu", time: "10:15 AM" },
    { product: "Math Book", seller: "Shakil", buyer: "Asif", time: "11:00 AM" },
    { product: "Backpack", seller: "Tanha", buyer: "Adil", time: "01:30 PM" },
    { product: "Calculator", seller: "Nadia", buyer: "Fahim", time: "02:45 PM" },
    { product: "Notebook Set", seller: "Habib", buyer: "Ruma", time: "03:20 PM" }
  ];
  
  todaysSoldItems.forEach(item => {
    soldTable.innerHTML += `
      <tr>
        <td>${item.product}</td>
        <td>${item.seller}</td>
        <td>${item.buyer}</td>
        <td>${item.time}</td>
      </tr>
    `;
  });

  // Populate dashboard messages
  const msgBox = document.getElementById('messages');
  const recentMessages = data.messages.slice(0, 3);
  recentMessages.forEach(msg => {
    msgBox.innerHTML += `<div class="msg"><strong>${msg.sender}:</strong> ${msg.content}</div>`;
  });

  // Setup sorting for Buyers, Sellers, Products tables
  setupSorting('buyersTable', buyerSort, populateBuyersTable);
  setupSorting('sellersTable', sellerSort, populateSellersTable);
  setupSorting('productsTable', productSort, populateProductsTable);

  // Load initial data for Buyers, Sellers, Products
  populateBuyersTable();
  populateSellersTable();
  populateProductsTable();

  // Load Sold Items and Messages
  populateAllSoldItems();
  populateAllMessages();
});
