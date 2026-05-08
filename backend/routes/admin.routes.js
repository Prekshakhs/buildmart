const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getUsers,
  toggleUserStatus,
  approveSeller,
  getAllOrders,
  removeProduct,
  getProducts,
} = require("../controllers/admin.controller");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect);
router.use(authorize("admin"));

router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.put("/users/:id/toggle", toggleUserStatus);
router.put("/sellers/:id/approve", approveSeller);
router.get("/orders", getAllOrders);
router.get("/products", getProducts);
router.delete("/products/:id", removeProduct);

module.exports = router;
