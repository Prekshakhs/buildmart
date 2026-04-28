const asyncHandler = require("express-async-handler");
const Cart = require("../models/Cart.model");
const Product = require("../models/Product.model");
const { calculatePrice } = require("../utils/pricingCalculator");

// ─── Helper: get or create cart ───────────────────────────────────────────────
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    select: "name images retailPrice wholesaleTiers stock isActive",
  });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// ─── Build cart response with computed prices ─────────────────────────────────
const buildCartResponse = (cart) => {
  const itemsWithPricing = cart.items.map((item) => {
    if (!item.product) return null;
    const { unitPrice, tierLabel, totalPrice } = calculatePrice(
      item.quantity,
      item.product.retailPrice,
      item.product.wholesaleTiers
    );
    return {
      product: item.product,
      quantity: item.quantity,
      unitPrice,
      tierLabel,
      totalPrice,
    };
  }).filter(Boolean);

  const grandTotal = itemsWithPricing.reduce((sum, i) => sum + i.totalPrice, 0);

  return {
    _id: cart._id,
    items: itemsWithPricing,
    totalItems: itemsWithPricing.reduce((sum, i) => sum + i.quantity, 0),
    grandTotal: parseFloat(grandTotal.toFixed(2)),
  };
};

// ─── @GET /api/cart ───────────────────────────────────────────────────────────
const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.json({ success: true, data: buildCartResponse(cart) });
});

// ─── @POST /api/cart/add ──────────────────────────────────────────────────────
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} units available in stock`);
  }

  const { unitPrice } = calculatePrice(quantity, product.retailPrice, product.wholesaleTiers);

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = new Cart({ user: req.user._id, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (i) => i.product.toString() === productId
  );

  if (existingIndex > -1) {
    const newQty = cart.items[existingIndex].quantity + Number(quantity);
    if (newQty > product.stock) {
      res.status(400);
      throw new Error(`Cannot add more. Only ${product.stock} units available`);
    }
    cart.items[existingIndex].quantity = newQty;
    cart.items[existingIndex].priceAtAdd = calculatePrice(
      newQty,
      product.retailPrice,
      product.wholesaleTiers
    ).unitPrice;
  } else {
    cart.items.push({ product: productId, quantity: Number(quantity), priceAtAdd: unitPrice });
  }

  await cart.save();
  await cart.populate({ path: "items.product", select: "name images retailPrice wholesaleTiers stock" });

  res.json({
    success: true,
    message: "Item added to cart",
    data: buildCartResponse(cart),
  });
});

// ─── @PUT /api/cart/update ────────────────────────────────────────────────────
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (quantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }
  if (product.stock < quantity) {
    res.status(400);
    throw new Error(`Only ${product.stock} units available`);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemIndex = cart.items.findIndex((i) => i.product.toString() === productId);
  if (itemIndex === -1) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  cart.items[itemIndex].quantity = Number(quantity);
  cart.items[itemIndex].priceAtAdd = calculatePrice(
    quantity,
    product.retailPrice,
    product.wholesaleTiers
  ).unitPrice;

  await cart.save();
  await cart.populate({ path: "items.product", select: "name images retailPrice wholesaleTiers stock" });

  res.json({ success: true, message: "Cart updated", data: buildCartResponse(cart) });
});

// ─── @DELETE /api/cart/remove/:productId ──────────────────────────────────────
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = cart.items.filter(
    (i) => i.product.toString() !== req.params.productId
  );

  await cart.save();
  await cart.populate({ path: "items.product", select: "name images retailPrice wholesaleTiers stock" });

  res.json({ success: true, message: "Item removed from cart", data: buildCartResponse(cart) });
});

// ─── @DELETE /api/cart/clear ──────────────────────────────────────────────────
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ success: true, message: "Cart cleared" });
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
