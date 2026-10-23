# 🌍 TravelHub - Complete Travel Booking App

🚀 **Live Demo:** [complete-travel-app.vercel.app](https://complete-travel-app.vercel.app/)

TravelHub is a premium, full-stack travel booking and customization application. Built with a modern **React/Vite** frontend and a secure **Express/MongoDB** backend, it provides a seamless experience for customers looking to book vacation packages or build their own custom trips, along with a powerful **Admin Panel** for management.

---

## ✨ Features

### 👤 Customer Experience
- **Interactive Home Page**: Dynamic search, trending destination chips, client reviews, and custom-trip CTAs.
- **Holiday Packages**: Detailed page for browsing preset packages with filters for Category, Budget, Duration, and Difficulty.
- **Custom Trip Builder**: Drag-and-drop/step-by-step wizard to build a fully custom holiday, calculate price estimations in real time, and submit quotes.
- **Secure Authentication**: OTP-based email verification, JWT-based user session persistence, and password reset capability.
- **Booking Flow**: Multi-traveler checkout with secure billing summaries and email notifications.

### 👑 Admin Control Panel
- **Analytics Dashboard**: Statistics for total packages, trip leads (custom packages), total bookings, and estimated revenue.
- **Package Management**: CRUD operations for packages including multiple image uploads via Cloudinary.
- **Destination Management**: Pricing engines, region details, custom image uploads, and classification (Domestic vs. International).
- **Leads & Booking Management**: Track custom trip inquiries, update statuses (submitted, confirmed, cancelled), and direct links to contact customers via WhatsApp or Email.

---

## 🛠️ Tech Stack

| Frontend | Backend | Database & Services |
| :--- | :--- | :--- |
| **React 18** (Vite) | **Node.js** & **Express** | **MongoDB Atlas** (Mongoose) |
| **Tailwind CSS** (Styling) | **JWT** (Token Auth) | **Cloudinary** (Image Uploads) |
| **Framer Motion** (Animations) | **Nodemailer** (Gmail SMTP) | **Stripe** (Planned Payments) |
| **Lucide React** (Icons) | **Multer** (Form-Data Uploads) | **Winston** (Structured Logging) |

---

## 📂 Project Structure

```text
complete-travel-app/
├── backend/                  # Node/Express REST API
│   ├── src/
│   │   ├── config/           # Database connections
│   │   ├── controllers/      # Route logic handlers
│   │   ├── middleware/       # Auth & Security checks
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express endpoint routers
│   │   └── utils/            # Helper services (Email, Cloudinary, OTP)
│   └── package.json
│
└── frontend/                 # React SPA (Client)
    ├── src/
    │   ├── components/       # Reusable layout & common components
    │   ├── context/          # Auth & Global Context providers
    │   ├── pages/            # View pages (Home, Packages, Admin Dashboard)
    │   ├── services/         # Axios API endpoints definition
    │   └── App.jsx
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- MongoDB account (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### 1. Backend Setup

Navigate to the `backend` folder:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory using the variables below:
```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your-mongodb-atlas-connection-uri

# JWT Auth
JWT_SECRET=your-jwt-random-secret-key

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# Email Service (Nodemailer)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=your-email@gmail.com

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### Run Seed Scripts & Create Admin:
Before launching the server, set your default admin details in `.env` and create the admin account:
```bash
npm run create-admin
```
Start the backend development server:
```bash
npm run dev
```

---

### 2. Frontend Setup

Navigate to the `frontend` folder:
```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

---

## ☁️ Deployment Guide

### Backend Deployment (e.g. Render, Railway, Heroku)
- **Root Directory**: `backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Environment Variables**: Copy all variables from your local `backend/.env` file.

### Frontend Deployment (e.g. Vercel, Netlify)
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Set `VITE_API_URL` to your production backend API URL (e.g., `https://api.yourdomain.com/api`).

---

## 🔒 Security Best Practices
- **Strict Headers & Helmet**: Cross-Origin settings and XSS protection enabled.
- **Express Rate Limiter**: Limits requests to API endpoints to prevent brute-force attacks.
- **Environment Variables**: Sensitive tokens, Mongo URIs, and credentials are never checked into git (enforced by `.gitignore`).
