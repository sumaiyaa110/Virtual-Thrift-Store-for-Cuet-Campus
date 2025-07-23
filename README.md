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

> *(Upload your screenshots in the `assets` folder and reference them below)*

### 🏠 Home Page
![Home Page](homeCSS.png)

### 🔐 Login / Sign Up
![Login Page](SignupCSS.png)

### 🛡️ Admin Dashboard

The Admin Dashboard provides multiple management features, fetching data dynamically from backend APIs (users and products).

#### Main Page
Displays an overview of all important statistics and data fetched from the backend APIs.
![Admin Dashboard Main](admin11.png)

---

#### Managing Registered Sellers
Admins can view, approve, or remove registered sellers from the platform.
![Manage Sellers](admin22.png)

---

#### Managing Buyers
View and manage all registered buyers, including account details and activities.
![Manage Buyers](admin44.png)

---

#### Managing Sold Items
Track and manage items sold through the platform, including order status and revenue.
![Manage Sold Items](admin-dashboard-sold-items.png)

---

#### Managing All Listed Products
Admins can view, edit, or remove any products listed by sellers on the platform.
![Manage Products](admin33.png)


### 👩‍🎓 Buyer Dashboard
![Buyer Dashboard](buyer-dashboard.png)

### 🧑‍🔧 Seller Dashboard
![Seller Dashboard](seller-dashboard.png)

### 💬 Messaging Page
![Messaging Page](seller_message.jpg)

### 📝 About Us
![About Us Page](./assets/about-page.png)

### 📩 Contact Page
![Contact Page](./assets/contact-page.png)

### 🗣️ Feedback Page
![Feedback Page](./assets/feedback-page.png)

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

