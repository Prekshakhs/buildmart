import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CreditCard, Truck } from "lucide-react";
import { orderService, paymentService } from "../api/services";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatCurrency, getErrMsg } from "../utils/helpers";
import toast from "react-hot-toast";

export default function Checkout() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    street: "", city: "", state: "", pincode: "", country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const shippingCharge = cart.grandTotal >= 5000 ? 0 : 99;
  const grandTotal = cart.grandTotal + shippingCharge;

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
        grandTotal,
        "INR"
      );
      const razorpayOrderId = orderResponse.data.orderId;

      // Step 2: Open Razorpay checkout modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY || "YOUR_RAZORPAY_KEY_ID",
        amount: Math.round(grandTotal * 100), // in paise
        currency: "INR",
        name: "PickMyTools",
        description: "Order Payment",
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

            // Step 4: Create order with verified payment
            if (verifyResponse.success) {
              const { data: orderData } = await orderService.place({
                shippingAddress: form,
                paymentMethod: "razorpay",
                razorpay_payment_id: response.razorpay_payment_id,
              });

              clearCart();
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
      const { data } = await orderService.place({
        shippingAddress: form,
        paymentMethod,
      });
      clearCart();
      toast.success("Order placed successfully!");
      navigate(`/orders/${data.data._id}`);
    } catch (err) {
      toast.error(getErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="section-title mb-8">Checkout</h1>
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
                { value: "stripe", label: "Stripe", desc: "International Cards", icon: "🌐" },
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
              {cart.items.map((item) => (
                <div key={item.product._id} className="flex justify-between text-sm font-body text-steel-400 gap-2">
                  <span className="truncate">{item.product.name} ×{item.quantity}</span>
                  <span className="font-mono flex-shrink-0">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>
            <div className="divider" />
            <div className="space-y-2 text-sm font-body">
              <div className="flex justify-between text-steel-400">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(cart.grandTotal)}</span>
              </div>
              <div className="flex justify-between text-steel-400">
                <span>Shipping</span>
                <span className={`font-mono ${shippingCharge === 0 ? "text-emerald-400" : ""}`}>
                  {shippingCharge === 0 ? "FREE" : formatCurrency(shippingCharge)}
                </span>
              </div>
            </div>
            <div className="divider" />
            <div className="flex justify-between items-center">
              <span className="font-display font-700 uppercase tracking-wide text-steel-200">Total</span>
              <span className="font-display font-800 text-2xl text-amber-400">{formatCurrency(grandTotal)}</span>
            </div>
            <button onClick={handlePlaceOrder} disabled={loading || cart.items.length === 0} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? (paymentMethod === "razorpay" ? "Opening Payment…" : "Placing Order…") : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
