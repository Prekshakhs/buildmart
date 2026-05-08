import API from "./axiosInstance";

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authService = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  getMe: () => API.get("/auth/me"),
  updateProfile: (data) => API.put("/auth/profile", data),
  changePassword: (data) => API.put("/auth/change-password", data),
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

// ─── Admin ────────────────────────────────────────────────────────────────────
export const adminService = {
  getDashboard: () => API.get("/admin/dashboard"),
  getUsers: (params) => API.get("/admin/users", { params }),
  toggleUser: (id) => API.put(`/admin/users/${id}/toggle`),
  approveSeller: (id) => API.put(`/admin/sellers/${id}/approve`),
  getOrders: (params) => API.get("/admin/orders", { params }),
  getProducts: (params) => API.get("/admin/products", { params }),
  removeProduct: (id) => API.delete(`/admin/products/${id}`),
};
