// Format currency in INR
export const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

// Calculate tiered price (mirrors backend logic)
export const calculatePrice = (quantity, retailPrice, wholesaleTiers = []) => {
  let unitPrice = retailPrice;
  let tierLabel = "Retail";
  const sorted = [...wholesaleTiers].sort((a, b) => b.minQty - a.minQty);
  for (const tier of sorted) {
    if (quantity >= tier.minQty) {
      unitPrice = tier.price;
      tierLabel = tier.label || `${tier.minQty}+ units`;
      break;
    }
  }
  return { unitPrice, tierLabel, totalPrice: unitPrice * quantity };
};

// Order status config
export const ORDER_STATUS = {
  pending:   { label: "Pending",   className: "badge-gray" },
  confirmed: { label: "Confirmed", className: "badge-blue" },
  shipped:   { label: "Shipped",   className: "badge-amber" },
  delivered: { label: "Delivered", className: "badge-green" },
  cancelled: { label: "Cancelled", className: "badge-red" },
};

// Truncate text
export const truncate = (str, n = 80) => str?.length > n ? str.slice(0, n) + "…" : str;

// Get error message from axios error
export const getErrMsg = (err) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || err?.message || "Something went wrong";

// Format order timestamp for timeline
export const formatOrderTimestamp = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
