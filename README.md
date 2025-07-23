# 🧥 Virtual Thrift Store for CUET Campus

Welcome to the **Virtual Thrift Store for CUET Campus** — a user-friendly and sustainable platform where CUET students can buy, sell used items like clothes, books, gadgets, etc., within their campus community.

---

## 🌟 Key Highlights

- 🔍 **Powerful Home Page** – Beautifully designed landing page with product search functionality.
- 🧭 **Navigation Bar** – Includes: Sign Up / Login, Featured Products, About Us, Contact Us, Feedback, Admin Login.
- 🛍️ **Role-based Access** – Buyer (CUET students), Seller (Anyone), Admin (Single system admin).
- 💬 **Messaging System** – Buyers can contact sellers directly for any product.
- 🛒 **Wishlist & Cart** – Buyers can add products to their cart or wishlist for later.
- 🛠️ **Admin Control** – Admin can manage users, verify product statuses, and view daily sales.

---

## 👥 User Roles

### 👩‍🎓 Buyer (Anyone)
- View all available products.
- Contact sellers directly from the product page.
- Add products to **Cart** or **Wishlist**.
- View feedback and reach out via the **Contact Us** page.

### 🧑‍🔧 Seller (CUET Students Only)
- Upload product with image, description, and price.
- View uploaded product list.
- See messages from buyers on individual product listings.
- View list of products sold daily.

### 🛡️ Admin (Only One)
- View complete lists of **buyers** and **sellers**.
- See today's **sold products**.
- Change product status to **Active** or **Sold**.
- View full list of **sold items** historically.

---

## 📸 Screenshots


### 🏠 Home Page
![Home Page](homeCSS.png)

### 🔐 Login / Sign Up
![Login Page](SignupCSS.png)

### 🛡️ Admin Dashboard

The Admin Dashboard provides multiple management features, fetching data dynamically from backend APIs (users and products).

#### Main Page
Displays an overview of all important statistics and data fetched from the backend APIs.
![Admin Dashboard Main](adminCss(1).jpg)

---

#### Managing Registered Sellers
Admins can view, approve, or remove registered sellers from the platform.
![Manage Sellers](admin11.jpg)

---

#### Managing Buyers
View and manage all registered buyers, including account details and activities.
![Manage Buyers](admin22.jpg)

---

#### Sold Items History
Track sold through the platform, including buyer, seller and sale date.
![Manage Sold Items](admin44.jpg)

---

#### Managing All Listed Products
Admins can view, edit, or remove any products listed by sellers on the platform.
![Manage Products](admin33.jpg)


### 👩‍🎓 Buyer Dashboard
![Buyer Dashboard](buyer-dashboard.png)

### 🧑‍🔧 Seller Dashboard

The Seller Dashboard allows sellers to manage their products and listings, all connected to the database for real-time updates.


#### Main Page  
Sellers can view their listed products directly from the dashboard.  
![Manage Listings](sellerCss1.jpg)

---

#### Uploading Products  
Sellers can upload new products with details like name, price, description, and images.  
![Upload Products](sellerCss2(2).jpg)


### 💬 Messaging Page
![Messaging Page](seller_message.jpg)

### 📝 About Us
![About Us Page](aboutCss.png)

### 📩 Contact Page
![Contact Page](contactCss.png)

### 🗣️ Feedback Page
![Feedback Page](feedback(1).jpg)

---

## ⚙️ Tech Stack

**Frontend**
- HTML5, CSS, JavaScript

**Backend**
- Node.js with Express.js
  
**Database**
- MySQL 

**Authentication**
- CUET email verification for sellers
- Session/token-based login for all users
- Role-based routing and access control

---

## 📂 Folder Structure

