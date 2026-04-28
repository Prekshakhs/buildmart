import React, { useState } from "react";
import { X, Loader, Send } from "lucide-react";
import { toast } from "react-toastify";
import { orderService } from "../api/services";

const RETURN_REASONS = [
  { value: "defective", label: "🔧 Defective / Not Working" },
  { value: "wrong_item", label: "❌ Wrong Item Received" },
  { value: "not_as_described", label: "📷 Not as Described" },
  { value: "damaged", label: "💥 Damaged on Delivery" },
  { value: "changed_mind", label: "🤔 Changed Mind" },
  { value: "better_price_elsewhere", label: "💰 Better Price Elsewhere" },
  { value: "quality_issues", label: "⭐ Quality Issues" },
  { value: "other", label: "📝 Other" },
];

export default function ReturnItemModal({
  isOpen,
  item,
  orderId,
  onClose,
  onSuccess,
}) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!reason) newErrors.reason = "Please select a return reason";
    if (!description.trim()) {
      newErrors.description = "Please provide a brief description";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted - item:", item, "orderId:", orderId, "reason:", reason, "description:", description);

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setLoading(true);
    try {
      const response = await orderService.requestReturn(orderId, item?.index, {
        reason,
        description,
      });

      toast.success("Return request submitted successfully!");
      onSuccess?.(response.data.data);
      handleClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to request return");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setDescription("");
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-steel-900 border border-steel-700 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-steel-800 sticky top-0 bg-steel-950">
          <div>
            <h2 className="text-lg font-display font-700 text-steel-100">
              Return Product
            </h2>
            <p className="text-xs text-steel-500 mt-1">{item?.name}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-steel-800 rounded transition-colors"
            type="button"
          >
            <X size={20} className="text-steel-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Return Reason */}
          <div>
            <label className="label">Return Reason</label>
            <div className="grid grid-cols-1 gap-2">
              {RETURN_REASONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center p-3 border border-steel-700 rounded cursor-pointer hover:bg-steel-800/50 transition-colors"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={opt.value}
                    checked={reason === opt.value}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (errors.reason)
                        setErrors((prev) => ({ ...prev, reason: "" }));
                    }}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 text-sm text-steel-300">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
            {errors.reason && (
              <p className="text-xs text-red-400 mt-2">{errors.reason}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (Required)</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: "" }));
              }}
              placeholder="Please explain why you want to return this item. Be specific if there are defects or damage."
              className="input min-h-[120px] resize-none"
              maxLength="500"
            />
            <p className="text-xs text-steel-500 mt-1">
              {description.length}/500
            </p>
            {errors.description && (
              <p className="text-xs text-red-400 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 rounded space-y-1">
            <p className="font-semibold">📋 Return Process:</p>
            <p>1. Submit return request (you are here)</p>
            <p>2. Seller approves within 2-3 days</p>
            <p>3. Ship the item back to seller</p>
            <p>4. Refund processed after receipt</p>
          </div>

          {/* Item Details */}
          <div className="p-3 bg-steel-800 rounded border border-steel-700 text-sm space-y-1">
            <p className="text-steel-500 text-xs uppercase tracking-wide">
              Return Details
            </p>
            <div className="flex justify-between">
              <span className="text-steel-400">Quantity:</span>
              <span className="text-steel-200 font-semibold">
                {item?.quantity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel-400">Refund Amount:</span>
              <span className="text-amber-400 font-semibold">
                ₹{item?.totalPrice}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-steel-800 hover:bg-steel-700 text-steel-300 rounded font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason || !description.trim()}
              className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Submit Return
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
