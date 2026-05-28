const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

// Routes
const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const paymentRoutes = require("./routes/payment.routes");
const orderRoutes = require("./routes/order.routes");
const sellerRoutes = require("./routes/seller.routes");
const adminRoutes = require("./routes/admin.routes");
const categoryRoutes = require("./routes/category.routes");
const reviewRoutes = require("./routes/review.routes");
const returnRoutes = require("./routes/return.routes");
const notificationRoutes = require("./routes/notification.routes");
const sessionRoutes = require("./routes/session.routes");
const securityAlertRoutes = require("./routes/securityAlert.routes");
const faqRoutes = require("./routes/faq.routes");
const contactRoutes = require("./routes/contact.routes");

// Connect to Database
connectDB();

const app = express();

// ─── Trust Proxy (for accurate IP addresses) ───────────────────────────────────
app.set("trust proxy", 1);

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "development" ? 1000 : 100, // Allow 1000 requests in dev, 100 in prod
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  skip: (req) => process.env.NODE_ENV === "development", // Skip rate limiting in development
});

// Apply rate limiter only to API routes (but skip in development)
app.use("/api/", limiter);

// ─── General Middleware ────────────────────────────────────────────────────────
app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://pick-my-tool.vercel.app",
        "https://buildmart.vercel.app",
        process.env.CLIENT_URL,
      ].filter(Boolean);

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Marketplace API is running 🚀",
    env: process.env.NODE_ENV,
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/returns", returnRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/security-alerts", securityAlertRoutes);
app.use("/api/faqs", faqRoutes);
app.use("/api/contact", contactRoutes);

// ─── Error Handling ────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

// Wait for DB connection before starting the server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(
        `\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
      );
      console.log(`📡 API Base: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

// Only call startServer if we haven't already connected to DB
if (!process.env.DB_READY) {
  startServer();
} else {
  app.listen(PORT, () => {
    console.log(
      `\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
    );
    console.log(`📡 API Base: http://localhost:${PORT}/api`);
  });
}
