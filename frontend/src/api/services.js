import API from "./axiosInstance";

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  logout: () => API.post("/auth/logout"),
  getMe: () => API.get("/auth/me"),
  verifyEmail: (token) => API.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => API.post("/auth/forgot-password", { email }),
  resetPassword: (token, newPassword) => API.post("/auth/reset-password", { token, newPassword }),
  changePassword: (data) => API.put("/auth/change-password", data),
  getLoginHistory: (limit = 20) => API.get(`/auth/login-history?limit=${limit}`),
  updateProfile: (data) => API.put("/auth/profile", data),
};

// ─── Profile ───────────────────────────────────────────────────────────────────
export const profileService = {
  getProfile: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
  uploadAvatar: (formData) =>
    API.post("/auth/upload-avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ─── Products ─────────────────────────────────────────────────────────────────
export const productService = {
  getAll: (params) => API.get("/products", { params }),
  getById: (id) => API.get(`/products/${id}`),
  getCities: () => API.get("/products/cities"),
  getSimilar: (id) => API.get(`/products/${id}/similar`),
  create: (formData) =>
    API.post("/products", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, formData) =>
    API.put(`/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => API.delete(`/products/${id}`),
  deleteImage: (id, publicId) =>
    API.delete(`/products/${id}/images/${publicId}`),
};

// ─── Reviews ───────────────────────────────────────────────────────────────────
export const reviewService = {
  getByProduct: (productId, params) =>
    API.get(`/reviews/product/${productId}`, { params }),
  checkExisting: (productId) => API.get(`/reviews/check-existing/${productId}`),
  create: (data) => API.post("/reviews", data),
  update: (reviewId, data) => API.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => API.delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId) => API.post(`/reviews/${reviewId}/helpful`),
};

// ─── Categories ───────────────────────────────────────────────────────────────
export const categoryService = {
  getAll: () => API.get("/categories"),
  create: (data) => API.post("/categories", data),
  update: (id, data) => API.put(`/categories/${id}`, data),
  delete: (id) => API.delete(`/categories/${id}`),
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
export const cartService = {
  get: () => API.get("/cart"),
  add: (productId, quantity) => API.post("/cart/add", { productId, quantity }),
  update: (productId, quantity) =>
    API.put("/cart/update", { productId, quantity }),
  remove: (productId) => API.delete(`/cart/remove/${productId}`),
  clear: () => API.delete("/cart/clear"),
};

// ─── Wishlist ──────────────────────────────────────────────────────────────────
export const wishlistService = {
  get: () => API.get("/wishlist"),
  add: (productId) => API.post("/wishlist/add", { productId }),
  remove: (productId) => API.delete(`/wishlist/remove/${productId}`),
  checkStatus: (productId) => API.get(`/wishlist/status/${productId}`),
  clear: () => API.delete("/wishlist/clear"),
};

// ─── Payments ──────────────────────────────────────────────────────────────────
export const paymentService = {
  createRazorpayOrder: (amount, currency = "INR") =>
    API.post("/payments/create-order", { amount, currency }),
  verifyPayment: (razorpay_order_id, razorpay_payment_id, razorpay_signature) =>
    API.post("/payments/verify", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    }),
  refundPayment: (orderId, reason) =>
    API.post(`/payments/refund/${orderId}`, { reason }),
};

// ─── Orders ───────────────────────────────────────────────────────────────────
export const orderService = {
  place: (data) => API.post("/orders", data),
  placeDirect: (data) => API.post("/orders/direct", data),
  getMyOrders: (params) => API.get("/orders", { params }),
  getById: (id) => API.get(`/orders/${id}`),
  cancel: (id, reason) => API.put(`/orders/${id}/cancel`, { reason }),
  cancelItem: (id, itemIndex) =>
    API.put(`/orders/${id}/items/${itemIndex}/cancel`),
  updateStatus: (id, itemIndex, status, note) =>
    API.put(`/orders/${id}/items/${itemIndex}/status`, { status, note }),
  // Return endpoints - Flipkart style
  requestReturn: (orderId, itemIndex, data) =>
    API.post("/returns/request", { orderId, itemIndex, ...data }),
  markReturnShipped: (orderId, itemIndex, trackingId) =>
    API.put("/returns/ship", { orderId, itemIndex, trackingId }),
  getMyReturns: (params) => API.get("/returns/my-returns", { params }),
};

// ─── Seller ───────────────────────────────────────────────────────────────────
export const sellerService = {
  getDashboard: () => API.get("/seller/dashboard"),
  getDashboardStats: () => API.get("/seller/dashboard/stats"),
  getProducts: (params) => API.get("/seller/products", { params }),
  getOrders: (params) => API.get("/seller/orders", { params }),
  bulkUpdateStatus: (orderIds, status, note) =>
    API.put("/seller/orders/bulk-status", { orderIds, status, note }),
  // Return endpoints - Flipkart style
  getReturnRequests: (params) =>
    API.get("/returns/seller/requests", { params }),
  approveReturn: (orderId, itemIndex) =>
    API.put("/returns/approve", { orderId, itemIndex }),
  rejectReturn: (orderId, itemIndex) =>
    API.put("/returns/reject", { orderId, itemIndex }),
  confirmReturnReceived: (orderId, itemIndex) =>
    API.put("/returns/confirm-received", { orderId, itemIndex }),
};

// ─── Notifications ────────────────────────────────────────────────────────
export const notificationService = {
  getNotifications: (params) => API.get("/notifications", { params }),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  delete: (id) => API.delete(`/notifications/${id}`),
  markAllAsRead: () => API.put("/notifications/mark-all-read"),
  getPreferences: () => API.get("/notifications/preferences"),
  updatePreferences: (prefs) => API.put("/notifications/preferences", prefs),
  registerDevice: (token) => API.post("/notifications/register-device", { token }),
};

// ─── Admin ────────────────────────────────────────────────────────────────
export const adminService = {
  getDashboard: () => API.get("/admin/dashboard"),
  getUsers: (params) => API.get("/admin/users", { params }),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
  approveSeller: (id) => API.put(`/admin/sellers/${id}/approve`),
  getOrders: (params) => API.get("/admin/orders", { params }),
  getProducts: (params) => API.get("/admin/products", { params }),
  removeProduct: (id) => API.delete(`/admin/products/${id}`),
};

// ─── Security Alerts ──────────────────────────────────────────────────────────
export const securityAlertService = {
  getAlerts: (params) => API.get("/security-alerts", { params }),
  getUnreadCount: () => API.get("/security-alerts/unread-count"),
  getAlert: (id) => API.get(`/security-alerts/${id}`),
  markAsRead: (id) => API.put(`/security-alerts/${id}/read`),
  markAllAsRead: () => API.put("/security-alerts/read-all"),
  deleteAlert: (id) => API.delete(`/security-alerts/${id}`),
};

// ─── Sessions ──────────────────────────────────────────────────────────────
export const sessionService = {
  getActiveSessions: () => API.get("/sessions"),
  getSession: (id) => API.get(`/sessions/${id}`),
  revokeSession: (id) => API.delete(`/sessions/${id}`),
  revokeAllSessions: (data) => API.post("/sessions/revoke-all", data),
};

// ─── FAQs ──────────────────────────────────────────────────────────────────────
export const faqService = {
  getAll: (page = 1) => API.get("/faqs", { params: { page, limit: 10 } }),
  getById: (id) => API.get(`/faqs/${id}`),
  search: (query, page = 1) =>
    API.get("/faqs/search", { params: { q: query, page, limit: 10 } }),
  getByCategory: (category, page = 1) =>
    API.get(`/faqs/category/${category}`, { params: { page, limit: 10 } }),
  markHelpful: (id) => API.post(`/faqs/${id}/helpful`),
  markUnhelpful: (id) => API.post(`/faqs/${id}/unhelpful`),
  // Admin endpoints
  getAllAdmin: (params) => API.get("/faqs/admin/all", { params }),
  create: (data) => API.post("/faqs", data),
  update: (id, data) => API.put(`/faqs/${id}`, data),
  delete: (id) => API.delete(`/faqs/${id}`),
};

// ─── Contact ───────────────────────────────────────────────────────────────────
export const contactService = {
  submit: (data) => API.post("/contact", data),
  // Admin endpoints
  getAll: (params) => API.get("/contact/admin", { params }),
  getById: (id) => API.get(`/contact/admin/${id}`),
  getStats: () => API.get("/contact/admin/stats"),
  updateStatus: (id, data) => API.patch(`/contact/admin/${id}/status`, data),
  reply: (id, data) => API.post(`/contact/admin/${id}/reply`, data),
};
