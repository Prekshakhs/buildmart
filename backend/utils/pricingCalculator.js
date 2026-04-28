/**
 * Calculate unit price based on quantity and wholesale tiers
 *
 * @param {number} quantity - quantity ordered
 * @param {number} retailPrice - base retail price
 * @param {Array} wholesaleTiers - array of { minQty, price, label }
 * @returns {{ unitPrice: number, tierLabel: string, totalPrice: number }}
 *
 * Example:
 *   retailPrice = 420
 *   wholesaleTiers = [
 *     { minQty: 10, price: 400, label: "10+ units" },
 *     { minQty: 50, price: 380, label: "50+ units" },
 *   ]
 *   calculatePrice(12, 420, tiers) → { unitPrice: 400, tierLabel: "10+ units", totalPrice: 4800 }
 */
const calculatePrice = (quantity, retailPrice, wholesaleTiers = []) => {
  let unitPrice = retailPrice;
  let tierLabel = "Retail";

  // Sort tiers descending by minQty, pick the highest qualifying tier
  const sorted = [...wholesaleTiers].sort((a, b) => b.minQty - a.minQty);

  for (const tier of sorted) {
    if (quantity >= tier.minQty) {
      unitPrice = tier.price;
      tierLabel = tier.label || `${tier.minQty}+ units`;
      break;
    }
  }

  return {
    unitPrice,
    tierLabel,
    totalPrice: parseFloat((unitPrice * quantity).toFixed(2)),
  };
};

/**
 * Calculate total cart value applying tier pricing per item
 * @param {Array} cartItems - [{ product, quantity }] with product populated
 * @returns {number} total cart value
 */
const calculateCartTotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    const { totalPrice } = calculatePrice(
      item.quantity,
      item.product.retailPrice,
      item.product.wholesaleTiers
    );
    return total + totalPrice;
  }, 0);
};

module.exports = { calculatePrice, calculateCartTotal };
