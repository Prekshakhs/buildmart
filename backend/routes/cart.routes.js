const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart } = require("../controllers/cart.controller");
const { protect, authorize } = require("../middleware/authMiddleware");

// All cart routes require login
router.use(protect);
router.use(authorize("buyer")); // Only buyers have carts

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/clear", clearCart);
router.delete("/remove/:productId", removeFromCart);

module.exports = router;
