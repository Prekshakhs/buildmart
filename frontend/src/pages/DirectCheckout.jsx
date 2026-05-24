import { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapPin, CreditCard, AlertCircle } from "lucide-react";
import { orderService, paymentService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, getErrMsg } from "../utils/helpers";
import toast from "react-hot-toast";

export default function DirectCheckout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = location.state?.items || [];

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    street: "", city: "", state: "", pincode: "", country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Calculate totals from items (not from cart)
  const totals = useMemo(() => {
    let itemsTotal = 0;
    items.forEach((item) => {
      itemsTotal += item.totalPrice || (item.unitPrice * item.quantity) || 0;
    });
    const shippingCharge = itemsTotal >= 5000 ? 0 : 99;
    return {
      itemsTotal,
      shippingCharge,
      grandTotal: itemsTotal + shippingCharge,
    };
  }, [items]);

  const initializeRazorpayPayment = async () => {
    try {
      setLoading(true);

      // Validate form first
      const required = ["fullName", "phone", "street", "city", "state", "pincode"];
      for (const k of required) {
        if (!form[k]) {
          toast.error(`Please fill in ${k}`);
          setLoading(false);
          return;
        }
      }

      // Step 1: Create Razorpay order
      const { data: orderResponse } = await paymentService.createRazorpayOrder(
        totals.grandTotal,
        "INR"
      );
      const razorpayOrderId = orderResponse.data.orderId;

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "YOUR_RAZORPAY_KEY_ID",
        amount: Math.round(totals.grandTotal * 100), // in paise
        currency: "INR",
        name: "PickMyTools",
        description: "Direct Purchase",
        order_id: razorpayOrderId,
        prefill: {
          name: form.fullName,
          email: user?.email || "",
          contact: form.phone,
        },
        theme: {
          color: "#9945FF",
        },
        handler: async (response) => {
          try {
            // Step 3: Verify payment signature
            const { data: verifyResponse } = await paymentService.verifyPayment(
              razorpayOrderId,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            // Step 4: Create direct order with verified payment
            if (verifyResponse.success) {
              const { data: orderData } = await orderService.placeDirect({
                items: items.map((item) => ({
                  productId: item.product?._id || item.productId,
                  quantity: item.quantity,
                })),
                shippingAddress: form,
                paymentMethod: "razorpay",
                razorpay_payment_id: response.razorpay_payment_id,
              });

              toast.success("Payment successful! Order created.");
              navigate(`/orders/${orderData.data._id}`);
            }
          } catch (error) {
            toast.error(
              `Payment verification failed: ${getErrMsg(error)}`
            );
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled by user");
            setLoading(false);
          },
        },
      };

      // Open checkout modal
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      toast.error(`Failed to initialize payment: ${getErrMsg(error)}`);
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    // If Razorpay, initialize payment flow
    if (paymentMethod === "razorpay") {
      await initializeRazorpayPayment();
      return;
    }

    // For COD, create order directly
    const required = ["fullName", "phone", "street", "city", "state", "pincode"];
    for (const k of required) {
      if (!form[k]) {
        toast.error(`Please fill in ${k}`);
        return;
      }
    }

    setLoading(true);
    try {
      const { data } = await orderService.placeDirect({
        items: items.map((item) => ({
          productId: item.product?._id || item.productId,
          quantity: item.quantity,
        })),
        shippingAddress: form,
        paymentMethod,
      });
      toast.success("Order placed successfully!");
      navigate(`/orders/${data.data._id}`);
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // Show error if no items
  if (!items || items.length === 0) {
    return (
      <div className="page-container">
        <div className="card p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={48} className="text-red-400" />
          <h2 className="font-display font-700 text-xl text-steel-200">No Items to Checkout</h2>
          <p className="text-steel-400">Please select a product and try again</p>
          <button onClick={() => navigate("/products")} className="btn-primary mt-4">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">Direct Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left: Address + Payment ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={18} className="text-amber-400" />
              <h2 className="font-display font-700 text-lg uppercase tracking-wide text-steel-200">Shipping Address</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: "fullName", label: "Full Name", placeholder: "John Doe", colSpan: "sm:col-span-2" },
                { key: "phone", label: "Phone Number", placeholder: "9876543210" },
                { key: "street", label: "Street Address", placeholder: "123, MG Road", colSpan: "sm:col-span-2" },
                { key: "city", label: "City", placeholder: "Bengaluru" },
                { key: "state", label: "State", placeholder: "Karnataka" },
                { key: "pincode", label: "Pincode", placeholder: "560001" },
              ].map(({ key, label, placeholder, colSpan = "" }) => (
                <div key={key} className={colSpan}>
                  <label className="label">{label}</label>
                  <input
                    value={form[key]}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    className="input"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard size={18} className="text-amber-400" />
              <h2 className="font-display font-700 text-lg uppercase tracking-wide text-steel-200">Payment Method</h2>
            </div>
            <div className="space-y-3">
              {[
                { value: "cod", label: "Cash on Delivery", desc: "Pay when your order arrives", icon: "💵" },
                { value: "razorpay", label: "Razorpay", desc: "UPI, Cards, Net Banking", icon: "💳" },
              ].map((opt) => (
                <label key={opt.value} className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${paymentMethod === opt.value ? "border-amber-400 bg-amber-400/5" : "border-steel-700 hover:border-steel-600"}`}>
                  <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value}
                    onChange={() => setPaymentMethod(opt.value)} className="accent-amber-400" />
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <p className="font-display font-700 text-sm uppercase tracking-wide text-steel-200">{opt.label}</p>
                    <p className="text-xs text-steel-500 font-body">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: Summary ──────────────────────────────────────────────────── */}
        <div>
          <div className="card p-6 sticky top-20 space-y-4">
            <h2 className="font-display font-700 text-lg uppercase tracking-wide text-steel-200">Order Summary</h2>
            <div className="divider" />
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm font-body text-steel-400 gap-2">
                  <span className="truncate">{item.name || item.product?.name} ×{item.quantity}</span>
                  <span className="font-mono flex-shrink-0">{formatCurrency(item.totalPrice || (item.unitPrice * item.quantity))}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between text-steel-400">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(totals.itemsTotal)}</span>
              </div>
              <div className="flex justify-between text-steel-400">
                <span>Shipping</span>
                <span className={`font-mono ${totals.shippingCharge === 0 ? "text-emerald-400" : ""}`}>
                  {totals.shippingCharge === 0 ? "FREE" : formatCurrency(totals.shippingCharge)}
                </span>
              </div>
            </div>
            <div className="divider" />
            <div className="flex justify-between items-center">
              <span className="font-display font-700 uppercase tracking-wide text-steel-200">Total</span>
              <span className="font-display font-800 text-2xl text-amber-400">{formatCurrency(totals.grandTotal)}</span>
            </div>
            <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? (paymentMethod === "razorpay" ? "Opening Payment…" : "Placing Order…") : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
