# PickMyTools - Shipping & Delivery Charges

## Overview

PickMyTools uses a **simple, transparent shipping model** to encourage bulk purchases and improve order economics.

---

## Shipping Charge Formula

### Current Rules

| Order Value  | Shipping Charge | Status  |
| ------------ | --------------- | ------- |
| **< ₹5,000** | ₹99             | Paid    |
| **≥ ₹5,000** | ₹0              | FREE 🎉 |

### Example Calculations

**Order 1 - Small Purchase**

```
Items Total:     ₹3,500
Shipping:        ₹99
─────────────────────
Grand Total:     ₹3,599
```

**Order 2 - Bulk Purchase (Qualifies for Free Shipping)**

```
Items Total:     ₹5,200
Shipping:        FREE (₹0)
─────────────────────
Grand Total:     ₹5,200
```

**Order 3 - Exactly at Threshold**

```
Items Total:     ₹5,000
Shipping:        FREE (₹0)
─────────────────────
Grand Total:     ₹5,000
```

---

## How It Works

### 1. **Checkout Page**

When a buyer goes to checkout:

- System calculates **Items Total** (sum of all products)
- Automatically determines shipping charge based on order value
- Displays shipping charge **before payment**
- Shows "FREE" in green if shipping is complimentary

### 2. **Backend Calculation**

In `order.controller.js` (line 69):

```javascript
const shippingCharges = itemsTotal >= 5000 ? 0 : 99;
const grandTotal = parseFloat((itemsTotal + shippingCharges).toFixed(2));
```

### 3. **Frontend Display**

In `Checkout.jsx` (line 24):

```javascript
const shippingCharge = cart.grandTotal >= 5000 ? 0 : 99;
```

---

## User-Facing Information

### Checkout Page Breakdown

```
Subtotal:          ₹4,500
Shipping:          ₹99          ← Added if < ₹5000
────────────────────────
Grand Total:       ₹4,599
```

### Shipping Status Badge

- **RED/Normal** - ₹99 shipping (for orders < ₹5000)
- **GREEN** - "FREE" shipping (for orders ≥ ₹5000)

---

## Business Logic

### Why ₹5,000 Threshold?

1. **Encourage Bulk Buying** 📦
   - Incentivizes larger orders
   - Reduces shipping cost per unit
   - Improves customer acquisition cost

2. **Free Shipping Economics** 💰
   - ₹99 covers basic logistics at that price point
   - Above ₹5,000, margin supports free shipping
   - Win-win for customers and sellers

3. **B2B Focus** 🏢
   - ₹5,000 is reasonable wholesale order size
   - Aligns with wholesale/bulk purchasing behavior
   - Typical for construction/hardware purchases

---

## Implementation Details

### Where Shipping is Calculated

**Backend:**

- `order.controller.js` - `placeOrder()` function (line 69)
- `order.controller.js` - `placeDirectOrder()` function (line 193)
- `order.controller.js` - `cancelItem()` function (recalculates on item cancellation)

**Frontend:**

- `Checkout.jsx` - Real-time display (line 24)
- `DirectCheckout.jsx` - Direct purchase flow

### Stored in Database

Order model stores:

```javascript
{
  itemsTotal: 4500,        // Sum of products
  shippingCharges: 99,     // ₹0 or ₹99
  grandTotal: 4599         // itemsTotal + shippingCharges
}
```

---

## Special Cases

### 1. **Item Cancellation After Order**

When a buyer cancels an individual item from an order:

- **System recalculates** shipping charges
- If new total drops below ₹5,000 → adds ₹99
- If new total stays above ₹5,000 → keeps ₹0
- Order total is updated in real-time

Example:

```
Original Order:     ₹6,000 (FREE shipping)
Cancel item:        -₹1,500
New Total:          ₹4,500
→ System adds:      +₹99 shipping charge
New Grand Total:    ₹4,599
```

### 2. **Multiple Sellers (Same Order)**

- Shipping calculated on **total cart value**
- Not per seller, but per order
- All items from all sellers count toward ₹5,000 threshold

### 3. **Cart Updates Before Checkout**

- Shipping charge updates dynamically
- As items added/removed, shipping recalculates
- User sees final shipping before confirming

---

## Future Customization Options

If you want to modify shipping rules:

**Change the threshold:**

```javascript
// Current: ₹5,000 free shipping, ₹99 otherwise
const shippingCharges = itemsTotal >= 5000 ? 0 : 99;

// Option 1: Higher threshold
const shippingCharges = itemsTotal >= 10000 ? 0 : 99;

// Option 2: Tiered shipping
let shippingCharges = 0;
if (itemsTotal < 2000) shippingCharges = 49;
else if (itemsTotal < 5000) shippingCharges = 79;
else shippingCharges = 0;

// Option 3: Percentage-based
const shippingCharges = itemsTotal >= 5000 ? 0 : Math.round(itemsTotal * 0.02);
```

**Add location-based shipping:**

```javascript
const shippingCharges = itemsTotal >= 5000 ? 0 : isMetroCity ? 59 : 99;
```

**Add weight-based shipping:**

```javascript
const shippingCharges = itemsTotal >= 5000 ? 0 : totalWeight > 50 ? 149 : 99;
```

---

## Customer Communication

### On Home Page (Features Bar)

✅ "Free shipping on orders above ₹5000"

### On Checkout Page

- Clear breakdown of shipping cost
- Green "FREE" label when applicable
- Shows exactly what they're paying

### In Help Center

Users can see shipping policy clearly documented

---

## Testing Shipping Logic

### Test Cases

**Test 1: Below Threshold**

1. Add items totaling ₹4,500
2. Go to checkout
3. Verify: Shipping = ₹99, Total = ₹4,599

**Test 2: At Threshold**

1. Add items totaling exactly ₹5,000
2. Go to checkout
3. Verify: Shipping = FREE, Total = ₹5,000

**Test 3: Above Threshold**

1. Add items totaling ₹6,500
2. Go to checkout
3. Verify: Shipping = FREE, Total = ₹6,500

**Test 4: Item Cancellation**

1. Order worth ₹6,000 (FREE shipping)
2. Cancel item worth ₹1,200
3. New total = ₹4,800
4. Verify: Shipping now = ₹99, New Total = ₹4,899

---

## Summary

**PickMyTools shipping is:**

- ✅ Simple and transparent
- ✅ Encourages larger orders
- ✅ Economically viable
- ✅ B2B focused
- ✅ Real-time calculated
- ✅ Easy to customize

**For customers:**

- Spend ₹5,000+ → Save ₹99 on shipping
- Clear pricing breakdown before payment
- No hidden charges
