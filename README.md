# 🏗️ BuildMart (PickMyTools) — Multi-Seller Construction Marketplace

A full-stack MERN e-commerce marketplace for construction materials, hardware tools, agricultural equipment, and safety gear. Features multi-role authentication (Buyer / Seller / Admin), Razorpay payments, real-time order tracking, returns management, and a professional seller dashboard.

> **Live Demo:** [pick-my-tool.vercel.app](https://pick-my-tool.vercel.app)  
> **API Health:** [buildmart-api-oy5t.onrender.com/api/health](https://buildmart-api-oy5t.onrender.com/api/health)

---

## 📸 Screenshots

| Home Page | Product Listing | Seller Dashboard |
|-----------|----------------|-----------------|
| ![Home](https://via.placeholder.com/300x180?text=Home+Page) | ![Products](https://via.placeholder.com/300x180?text=Products) | ![Dashboard](https://via.placeholder.com/300x180?text=Dashboard) |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Axios, React Hot Toast, Lucide Icons |
| **Backend** | Node.js, Express.js, Mongoose ODM, JWT (access + refresh tokens), Cookie-Parser |
| **Database** | MongoDB Atlas |
| **Payments** | Razorpay (UPI, Cards, Net Banking) |
| **Image Hosting** | Cloudinary |
| **Email** | Nodemailer (Gmail SMTP) |
| **Security** | Helmet, CORS, Rate Limiting, bcrypt, express-validator |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based auth with **access + refresh token** rotation
- Email verification on registration
- Password reset via email link
- Login attempt rate limiting & account lockout
- Session tracking with device/IP logging
- Security alerts (new login, failed attempts, password changes)
- Role-based access control (Buyer / Seller / Admin)

### 🛒 Buyer Features
- Browse products with search, category filters, and sorting
- Product detail pages with image gallery and wholesale pricing tiers
- Shopping cart with quantity management
- **Direct "Buy Now"** checkout (bypasses cart)
- Razorpay payment integration (UPI, Cards, Net Banking) + COD
- Order history with real-time status tracking
- **Individual item cancellation** from multi-item orders
- 30-day returns with reason tracking
- Wishlist functionality
- Notification center

### 📦 Seller Features
- Professional dashboard with revenue analytics
- Product CRUD with multiple image uploads (Cloudinary)
- Wholesale pricing tier configuration
- Order management with status updates (Pending → Confirmed → Shipped → Delivered)
- **Bulk order status updates** via checkbox selection
- Return request approval/rejection workflow
- Business profile with GSTIN support

### 👨‍💼 Admin Features
- Platform-wide dashboard with statistics
- User management (activate/deactivate accounts)
- Seller approval system
- Order monitoring across all sellers
- Product moderation

### 🎨 UI/UX
- Fully responsive (mobile, tablet, desktop)
- Dark theme with modern design system
- Skeleton loaders and loading states
- Toast notifications for user feedback
- Confirmation dialogs for destructive actions
- Share products via link/email

---

## 📁 Project Structure

```
buildmart/
├── backend/
│   ├── config/              # DB connection, seeders
│   ├── controllers/         # Route handlers (auth, orders, products, etc.)
│   ├── middleware/           # Auth, error handling, file upload
│   ├── models/              # Mongoose schemas
│   ├── routes/              # Express route definitions
│   ├── scripts/             # Database seed scripts
│   ├── services/            # Business logic (tokens, email, notifications)
│   ├── utils/               # Helpers (distance calculator, etc.)
│   ├── server.js            # Express app entry point
│   ├── .env.example         # Environment variable template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance & service modules
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # React context (Auth, Cart, Wishlist)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components (+ seller/ & admin/ subdirs)
│   │   ├── utils/           # Frontend helpers
│   │   └── App.jsx          # Root component with routing
│   ├── vercel.json          # Vercel SPA rewrite configuration
│   ├── .env.example         # Frontend env template
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v16+ and npm
- **MongoDB** (local install or [MongoDB Atlas](https://www.mongodb.com/atlas) free cluster)
- **Cloudinary** account ([sign up free](https://cloudinary.com))
- **Razorpay** account ([sign up free](https://dashboard.razorpay.com)) — for payment testing

### 1. Clone the Repository

```bash
git clone https://github.com/Prekshakhs/buildmart.git
cd buildmart
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file by copying the template:

```bash
cp .env.example .env
```

Fill in your credentials in `.env`:

```env
# Server
PORT=7777
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/marketplace_db

# JWT (change this to a long random string!)
JWT_SECRET=your_super_secret_jwt_key_change_this
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Email (Gmail App Password)
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-gmail-app-password
```

Start the backend:

```bash
npm run dev
```

The API will be running at `http://localhost:7777/api`

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file:

```env
VITE_API_BASE_URL=http://localhost:7777/api
VITE_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxx
```

Start the frontend:

```bash
npm run dev
```

Access the app at `http://localhost:5173`

### 4. Seed the Database (Optional)

Populate the database with sample categories, products, and test users:

```bash
cd backend
node scripts/seed.js              # Seeds 6 product categories
node scripts/seed-test-data.js    # Seeds 8 products + test users
```

**Test accounts created by the seeder:**

| Role | Email | Password |
|------|-------|----------|
| Buyer | `buyer@pickmytools.com` | `Buyer@123` |
| Seller | `seller@pickmytools.com` | `Seller@123` |

---

## 🌐 Deployment

### Architecture

```
┌──────────────────┐     HTTPS      ┌──────────────────┐     MongoDB      ┌──────────────────┐
│                  │ ──────────────▶ │                  │ ──────────────▶  │                  │
│   Vercel         │                 │   Render         │                  │  MongoDB Atlas   │
│   (Frontend)     │ ◀────────────── │   (Backend API)  │ ◀──────────────  │  (Database)      │
│                  │     JSON        │                  │                  │                  │
└──────────────────┘                 └──────────────────┘                  └──────────────────┘
```

### Frontend → Vercel

1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Framework Preset: **Vite**
4. Add environment variables:
   - `VITE_API_BASE_URL` = `https://your-render-app.onrender.com/api`
   - `VITE_RAZORPAY_KEY` = `rzp_test_xxxxxxxxxxxx`
5. Deploy

### Backend → Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables (all from `.env.example`, plus):
   - `NODE_ENV` = `production`
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `CLIENT_URL` = `https://your-vercel-app.vercel.app`

### ⚠️ Deployment Notes

- **Cross-Origin Cookies:** Auth tokens are sent via `Authorization: Bearer` headers in production (not cookies), since the frontend and backend are on different domains.
- **SPA Routing:** The `frontend/vercel.json` contains a rewrite rule to route all paths to `index.html` for React Router.
- **Render Cold Starts:** Free-tier Render services spin down after inactivity. The first request may take 30-60 seconds.

---

## 📚 API Reference

### Authentication
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | Login | ❌ |
| POST | `/api/auth/logout` | Logout | ✅ |
| GET | `/api/auth/me` | Get current user | ✅ |
| POST | `/api/auth/refresh` | Refresh access token | Cookie |
| POST | `/api/auth/forgot-password` | Request password reset | ❌ |
| POST | `/api/auth/reset-password` | Reset password with token | ❌ |
| PUT | `/api/auth/change-password` | Change password | ✅ |
| PUT | `/api/auth/profile` | Update profile | ✅ |

### Products
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/products` | List products (search, filter, sort) | ❌ |
| GET | `/api/products/:id` | Product details | ❌ |
| GET | `/api/categories` | List categories | ❌ |

### Orders
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/orders` | Place order (from cart) | ✅ Buyer |
| POST | `/api/orders/direct` | Place direct order (Buy Now) | ✅ Buyer |
| GET | `/api/orders` | Get my orders | ✅ Buyer |
| GET | `/api/orders/:id` | Order details | ✅ Buyer |
| PUT | `/api/orders/:id/cancel` | Cancel entire order | ✅ Buyer |
| PUT | `/api/orders/:id/items/:idx/cancel` | Cancel individual item | ✅ Buyer |

### Seller
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/seller/dashboard` | Dashboard stats | ✅ Seller |
| GET | `/api/seller/dashboard/stats` | Detailed analytics | ✅ Seller |
| GET | `/api/seller/products` | Seller's products | ✅ Seller |
| GET | `/api/seller/orders` | Seller's orders | ✅ Seller |
| PUT | `/api/seller/orders/bulk-status` | Bulk update statuses | ✅ Seller |

### Returns
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/returns` | Request a return | ✅ Buyer |
| GET | `/api/returns/my-returns` | My return requests | ✅ Buyer |
| GET | `/api/returns/seller/requests` | Seller's return requests | ✅ Seller |
| PUT | `/api/returns/:id/approve` | Approve return | ✅ Seller |
| PUT | `/api/returns/:id/reject` | Reject return | ✅ Seller |

### Payments
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/payments/create-order` | Create Razorpay order | ✅ |
| POST | `/api/payments/verify` | Verify payment signature | ✅ |

---

## 🗄️ Database Models

| Model | Description |
|-------|-------------|
| **User** | Buyers, Sellers, Admins with role-based fields, login history, email verification |
| **Product** | Items with images, retail + wholesale pricing, stock, specifications, tags |
| **Category** | Product categories with icons and slugs |
| **Cart** | Per-user shopping cart with product references |
| **Order** | Multi-item orders with status history, shipping, and payment info |
| **Return** | Return requests with approval workflow and refund tracking |
| **Review** | Product reviews and ratings |
| **Session** | Active login sessions with device/IP tracking |
| **SecurityAlert** | Security events (logins, failed attempts, password changes) |
| **Notification** | In-app notification system |

---

## 🔒 Security

- **JWT Access + Refresh Tokens** with httpOnly cookie support
- **Password Hashing** with bcrypt (salt rounds: 12)
- **Rate Limiting** — 100 requests/15 min in production
- **Helmet** — Security headers (XSS, clickjacking, MIME sniffing protection)
- **CORS** — Strict origin allowlist with Vercel preview URL support
- **Input Validation** — express-validator on all endpoints
- **Account Lockout** — Auto-locks after 5 failed login attempts

---

## 🧪 Test Credentials

After running the seed scripts:

| Role | Email | Password |
|------|-------|----------|
| 👤 Buyer | `buyer@pickmytools.com` | `Buyer@123` |
| 🏪 Seller | `seller@pickmytools.com` | `Seller@123` |

> Passwords must be 8+ characters with uppercase, lowercase, and numbers.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Preksha KHS** — [@Prekshakhs](https://github.com/Prekshakhs)

---

**Last Updated:** June 2026 | **Version:** 1.0.0
