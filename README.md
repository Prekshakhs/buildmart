# BuildMart - Multi-Seller E-Commerce Platform

A full-stack, modern e-commerce marketplace platform with buyer/seller/admin roles, order management, returns system, and seller dashboard.

## 🎯 Project Status

**Currently in Development** - Core features implemented and tested, additional features in progress.

### ✅ Completed Features

#### Authentication & User Management
- User registration (Buyer/Seller/Admin roles)
- JWT-based authentication
- Profile management with avatar uploads
- Password change functionality
- Role-based access control

#### Product Management
- Product creation and editing by sellers
- Multiple product images with Cloudinary integration
- Product search, filtering, and sorting
- Product categories
- Stock management
- Wholesale pricing tiers

#### Shopping Cart & Orders
- Add/remove products from cart
- Order placement with payment method selection
- Order status tracking (Pending → Confirmed → Shipped → Delivered)
- **Individual product cancellation** from orders (NEW!)
- Order history and details view
- Automatic stock restoration on cancellation

#### Seller Dashboard
- Dashboard statistics (pending items, order breakdown, revenue)
- Order management with filtering and search
- Bulk order status updates
- Order status overview with progress bars
- Seller profile information display

#### Returns Management
- 30-day return window from delivery date
- Return request submission with reason and description
- Seller approval/rejection workflow
- Return shipment tracking
- Automatic refund processing
- Stock restoration on approved returns
- Full return status history

#### Admin Panel
- User management and approval
- Seller approval system
- Order monitoring
- Product moderation
- Dashboard with platform statistics

#### Buyer Order Management
- Multiple product cancellation per order
- Confirmation dialogs for safety
- Real-time order total recalculation
- Automatic shipping charge updates
- Full audit trail in status history

## 🛠 Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for image hosting
- **Razorpay/Stripe** payment integration (foundations)

### Frontend
- **React 18** with modern hooks
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **Axios** for API calls
- **React Hot Toast** for notifications

## 📋 Project Structure

```
buildmart/
├── backend/
│   ├── models/              # MongoDB schemas
│   ├── controllers/         # Route handlers
│   ├── routes/             # Express routes
│   ├── middleware/         # Auth, error handling
│   ├── config/             # Database, constants
│   ├── utils/              # Helper functions
│   └── server.js           # Express app entry
│
└── frontend/
    ├── src/
    │   ├── pages/          # Page components
    │   ├── components/     # Reusable components
    │   ├── api/            # API services
    │   ├── context/        # React context
    │   ├── hooks/          # Custom React hooks
    │   └── utils/          # Helper functions
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm or yarn
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd buildmart
```

2. **Setup Backend**
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/buildmart
JWT_SECRET=your_jwt_secret_key
PORT=7777
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start backend:
```bash
npm run dev
```

3. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

Access application: `http://localhost:5173`

## 📚 API Documentation

### Key Endpoints

#### Orders
- `POST /api/orders` - Place order
- `GET /api/orders` - Get buyer's orders
- `GET /api/orders/:id` - Order details
- `PUT /api/orders/:id/cancel` - Cancel entire order
- **`PUT /api/orders/:id/items/:itemIndex/cancel`** - Cancel individual item ✨

#### Seller Dashboard
- `GET /api/seller/dashboard` - Dashboard stats
- `GET /api/seller/dashboard/stats` - Detailed statistics
- `GET /api/seller/orders` - Seller's orders
- `PUT /api/seller/orders/bulk-status` - Bulk update order status

#### Returns
- `POST /api/returns` - Request return
- `GET /api/returns/my-returns` - Buyer's returns
- `GET /api/returns/seller/requests` - Seller's return requests
- `PUT /api/returns/:id/approve` - Approve return
- `PUT /api/returns/:id/reject` - Reject return

## 🎨 UI Features

- **Responsive Design** - Mobile, tablet, and desktop friendly
- **Dark/Light Themes** - Modern color schemes
- **Real-time Notifications** - Toast messages for user feedback
- **Confirmation Dialogs** - Safe actions for critical operations
- **Loading States** - Skeleton loaders and spinners
- **Error Handling** - User-friendly error messages

## 📝 Recent Additions

### Individual Item Cancellation (Latest)
Buyers can now cancel individual products from orders without cancelling the entire order:
- Cancel button on each item in order details
- Confirmation dialog before cancellation
- Automatic stock restoration
- Real-time order total recalculation
- Visual "CANCELLED" badge on cancelled items
- Full audit trail in status history

### Seller Dashboard (Completed)
Professional dashboard for sellers with:
- Real-time statistics and analytics
- Order filtering and search
- Bulk actions for efficient management
- Seller profile information
- Order status overview

## 🔄 Workflow Examples

### Buyer Cancels Single Product
1. Buyer views order details
2. Selects product and clicks "Cancel" button
3. Confirmation dialog appears
4. Click "Cancel Item" to confirm
5. Item marked as cancelled (visual update)
6. Stock restored to seller
7. Order total recalculated
8. Status history updated

### Seller Manages Orders
1. Seller views dashboard
2. Applies filters (status, date range, search)
3. Selects orders via checkboxes
4. Chooses new status from dropdown
5. Clicks "Apply" and confirms
6. Multiple orders updated instantly
7. Dashboard refreshes automatically

## 📊 Database Models

- **User** - Buyers, Sellers, Admins
- **Product** - Items with images and pricing
- **Cart** - User shopping carts
- **Order** - Orders with items and status tracking
- **OrderItem** - Individual items in orders (with cancellation status)
- **Return** - Return requests and tracking
- **Category** - Product categories
- **Review** - Product reviews

## 🔒 Security

- JWT authentication for all protected routes
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Input validation on backend
- CORS configuration
- Secure environment variables

## 🚧 Planned Features

- Payment gateway integration (Razorpay/Stripe)
- Inventory management improvements
- Advanced analytics for sellers
- User reviews and ratings
- Wishlist functionality
- Email notifications
- SMS alerts
- Refund management UI
- Admin analytics dashboard
- Product recommendations

## 📞 Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include environment and error information

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributors

Built with ❤️ by the BuildMart team

---

**Last Updated:** April 2026
**Current Version:** 1.0.0-alpha
