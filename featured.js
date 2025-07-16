let allProducts = [];
    let currentFilter = 'all';

    // Load products from localStorage and display them
    function loadProducts() {
      // Load from seller products in localStorage
      const sellerProducts = JSON.parse(localStorage.getItem('sellerProducts')) || [];
      
      // Load existing featured products
      const existingFeatured = JSON.parse(localStorage.getItem('featuredProducts')) || [];
      
      // Combine and filter featured products
      allProducts = [...sellerProducts.filter(p => p.featured), ...existingFeatured];
      
      // Remove duplicates based on ID
      const uniqueProducts = allProducts.filter((product, index, self) => 
        index === self.findIndex(p => p.id === product.id)
      );
      
      allProducts = uniqueProducts;
      
      // Add default products if none exist
      if (allProducts.length === 0) {
        allProducts = getDefaultFeaturedProducts();
        localStorage.setItem('featuredProducts', JSON.stringify(allProducts));
      }

      updateStats();
      displayProducts(allProducts);
    }

    // Default featured products for demo
    function getDefaultFeaturedProducts() {
      return [
        {
          id: 101,
          name: "Gaming Laptop RTX 3060",
          category: "electronics",
          price: 85000,
          condition: "like-new",
          description: "High-performance gaming laptop with RTX 3060, perfect for CSE students. Barely used, comes with original box and warranty.",
          image: "https://via.placeholder.com/350x250/3cb371/ffffff?text=Gaming+Laptop",
          status: "active",
          featured: true,
          dateAdded: "2025-06-01",
          seller: "Ahmed Rahman",
          sellerId: "2019331045",
          views: 234
        },
        {
          id: 102,
          name: "Data Structures & Algorithms Book",
          category: "books",
          price: 800,
          condition: "good",
          description: "Essential CS textbook with notes and highlights. Great condition, all pages intact.",
          image: "https://via.placeholder.com/350x250/1e90ff/ffffff?text=CS+Textbook",
          status: "active",
          featured: true,
          dateAdded: "2025-05-28",
          seller: "Fatima Islam",
          sellerId: "2020331078",
          views: 156
        },
        {
          id: 103,
          name: "Study Desk with Drawers",
          category: "furniture",
          price: 4500,
          condition: "good",
          description: "Wooden study desk with multiple drawers for organization. Perfect for dorm rooms.",
          image: "https://via.placeholder.com/350x250/90ee90/000000?text=Study+Desk",
          status: "active",
          featured: true,
          dateAdded: "2025-06-02",
          seller: "Mohammad Ali",
          sellerId: "2019331089",
          views: 89
        },
        {
          id: 104,
          name: "iPhone 13 Pro",
          category: "electronics",
          price: 95000,
          condition: "like-new",
          description: "Excellent condition iPhone 13 Pro with all accessories. No scratches, battery health 98%.",
          image: "https://via.placeholder.com/350x250/ff69b4/ffffff?text=iPhone+13+Pro",
          status: "active",
          featured: true,
          dateAdded: "2025-06-03",
          seller: "Sarah Khan",
          sellerId: "2020331156",
          views: 345
        },
        {
          id: 105,
          name: "Cricket Kit Complete Set",
          category: "sports",
          price: 6500,
          condition: "good",
          description: "Complete cricket kit including bat, pads, gloves, helmet. Great for university team practice.",
          image: "https://via.placeholder.com/350x250/ffd700/000000?text=Cricket+Kit",
          status: "active",
          featured: true,
          dateAdded: "2025-05-30",
          seller: "Rakib Hassan",
          sellerId: "2019331112",
          views: 67
        }
      ];
    }

    // Update statistics
    function updateStats() {
      const totalFeatured = allProducts.length;
      const categories = [...new Set(allProducts.map(p => p.category))].length;
      const totalViews = allProducts.reduce((sum, p) => sum + (p.views || 0), 0);

      document.getElementById('totalFeatured').textContent = totalFeatured;
      document.getElementById('categoriesCount').textContent = categories;
      document.getElementById('totalViews').textContent = totalViews.toLocaleString();
    }

    // Display products
    function displayProducts(products) {
      const grid = document.getElementById('productsGrid');
      
      if (products.length === 0) {
        grid.innerHTML = `
          <div class="no-products">
            <h3>No Featured Products Found</h3>
            <p>No products match your current filter criteria.</p>
          </div>
        `;
        return;
      }

      grid.innerHTML = products.map(product => `
        <div class="product-card" data-category="${product.category}">
          <div class="featured-badge">⭐ Featured</div>
          <img src="${product.image}" alt="${product.name}" class="product-image">
          <div class="product-info">
            <h3>${product.name}</h3>
            <div class="product-details">
              <div class="detail-item">
                <span class="detail-label">Category</span>
                ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}
              </div>
              <div class="detail-item">
                <span class="detail-label">Condition</span>
                ${product.condition.charAt(0).toUpperCase() + product.condition.slice(1)}
              </div>
              <div class="detail-item">
                <span class="detail-label">Added</span>
                ${product.dateAdded}
              </div>
              <div class="detail-item">
                <span class="detail-label">Views</span>
                ${product.views || 0} views
              </div>
            </div>
            <div class="product-price">৳${product.price.toLocaleString()}</div>
            <p class="product-description">${product.description}</p>
            <div class="seller-info">
              <div class="seller-name">👤 ${product.seller}</div>
              <div class="seller-id">ID: ${product.sellerId}</div>
            </div>
            <div class="product-actions">
              <button class="btn btn-contact" onclick="contactSeller('${product.sellerId}', '${product.name}')">
                💬 Contact Seller
              </button>
              <button class="btn btn-favorite" onclick="addToFavorites(${product.id})">
                ❤️ Save
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Filter products by category
    function filterByCategory(category) {
      currentFilter = category;
      
      // Update active button
      document.querySelectorAll('.category-filter button').forEach(btn => {
        btn.classList.remove('active');
      });
      event.target.classList.add('active');

      // Filter and display products
      const filteredProducts = category === 'all' 
        ? allProducts 
        : allProducts.filter(p => p.category === category);
      
      displayProducts(filteredProducts);
    }

    // Search functionality
    document.getElementById('searchBox').addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase();
      const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            product.description.toLowerCase().includes(searchTerm) ||
                            product.seller.toLowerCase().includes(searchTerm);
        
        const matchesCategory = currentFilter === 'all' || product.category === currentFilter;
        
        return matchesSearch && matchesCategory;
      });
      
      displayProducts(filteredProducts);
    });

    // Contact seller function
    function contactSeller(sellerId, productName) {
      // In a real application, this would open a messaging interface
      alert(`Contact seller ${sellerId} about "${productName}"\n\nThis would normally open a messaging interface or redirect to a contact form.`);
    }

    // Add to favorites function
    function addToFavorites(productId) {
      // In a real application, this would save to user's favorites
      alert('Product added to your favorites!\n\nThis would normally save the product to your favorites list.');
    }

    // Auto-refresh products every 30 seconds to catch new additions
    setInterval(loadProducts, 30000);

    // Initialize page
    document.addEventListener('DOMContentLoaded', function() {
      loadProducts();
      
      // Add smooth scrolling for better UX
      document.documentElement.style.scrollBehavior = 'smooth';
    });

    // Handle page visibility change to refresh when returning to tab
    document.addEventListener('visibilitychange', function() {
      if (!document.hidden) {
        loadProducts();
      }
    });