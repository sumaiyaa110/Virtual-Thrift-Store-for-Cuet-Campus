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
          populateBuyersTable();
          break;
        case 'sellers':
          populateSellersTable();
          break;
        case 'products':
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

    function populateBuyersTable() {
      const table = document.getElementById('buyersTable');
      table.innerHTML = '';
      data.buyers.forEach(buyer => {
        const statusClass = buyer.status === 'active' ? 'status-active' : 'status-pending';
        table.innerHTML += `
          <tr>
            <td>${buyer.name}</td>
            <td>${buyer.id}</td>
            <td>${buyer.dept}</td>
            <td>${buyer.joinDate}</td>
             <td><span class="status-badge ${statusClass}">${buyer.status}</span></td>
            <td><button class="btn-remove" onclick="removeBuyer(${buyer.id})">Remove</button></td>
          </tr>
        `;
      });
    }

    function populateSellersTable() {
      const table = document.getElementById('sellersTable');
      table.innerHTML = '';
      data.sellers.forEach(seller => {
        const statusClass = seller.status === 'active' ? 'status-active' : 'status-pending';
        table.innerHTML += `
          <tr>
            <td>${seller.name}</td>
            <td>${seller.id}</td>
            <td>${seller.dept}</td>
            <td>${seller.listed}</td>
            <td>${seller.sold}</td>
            <td><span class="status-badge ${statusClass}">${seller.status}</span></td>
            <td><button class="btn-remove" onclick="removeSeller(${seller.id})">Remove</button></td>
          </tr>
        `;
      });
    }

    function populateProductsTable() {
      const table = document.getElementById('productsTable');
      table.innerHTML = '';
      data.products.forEach(product => {
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
             <td><button class="btn-remove" onclick="removeProduct(${product.id})">Remove</button></td>
          </tr>
        `;
      });
    }

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

    // Initialize dashboard data
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

      // Add animation to cards
      const cards = document.querySelectorAll('.card');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
          card.style.transition = 'all 0.5s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 200);
      });
    });