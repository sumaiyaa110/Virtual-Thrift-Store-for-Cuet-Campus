// Main JavaScript file for Campus Thrift Store
document.addEventListener('DOMContentLoaded', function() {
  // Welcome text typing effect
  const welcomeText = document.getElementById("welcomeText");
  const text = "Welcome to Campus Thrift Store!";
  let index = 0;

  function typeText() {
    if (index < text.length) {
      welcomeText.innerHTML += text.charAt(index);
      index++;
      setTimeout(typeText, 100); // Speed of typing effect
    }
  }

  // Start typing effect
  typeText();

  // Filter functionality
  const searchInput = document.getElementById("searchInput");
  const filterDropdown = document.querySelector(".filter-dropdown");
  const products = document.querySelectorAll(".product");

  function filterProducts() {
    const searchValue = searchInput.value.toLowerCase();
    const filterValue = filterDropdown.value.toLowerCase();
    
    products.forEach(product => {
      const productText = product.textContent.toLowerCase();
      const productCategory = product.getAttribute('data-category') || '';
      
      const matchesSearch = productText.includes(searchValue);
      const matchesFilter = filterValue === "" || productCategory === filterValue;
      
      product.style.display = (matchesSearch && matchesFilter) ? "block" : "none";
    });
  }

  // Add event listeners for search and filter
  searchInput.addEventListener("input", filterProducts);
  filterDropdown.addEventListener("change", filterProducts);

  // Carousel Image Change
  const Images = [
    "Images/home.png",
    "Images/books.png",
    "Images/bag.png",
    "Images/shoe.png",
    "Images/cal.png"
  ];

  let carouselIndex = 0;
  const carouselImage = document.getElementById("carouselImage");

  // Check if image exists and set up carousel
  if (carouselImage) {
    setInterval(() => {
      carouselIndex = (carouselIndex + 1) % Images.length;
      carouselImage.src = Images[carouselIndex];
    }, 3000);
  }
});
