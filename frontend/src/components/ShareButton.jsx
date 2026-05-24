import React, { useState } from "react";
import { Share2, Facebook, Twitter, Linkedin, Mail, Copy, X } from "lucide-react";
import { toast } from "react-toastify";

export default function ShareButton({ productName, productId, productUrl }) {
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = productUrl || `${window.location.origin}/products/${productId}`;
  const shareText = `Check out ${productName} on PickMyTools!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
    setIsOpen(false);
  };

  const shareOptions = [
    {
      name: "Facebook",
      icon: Facebook,
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "width=600,height=400"
        );
      },
      color: "text-blue-600",
    },
    {
      name: "Twitter",
      icon: Twitter,
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "width=600,height=400"
        );
      },
      color: "text-sky-500",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
          "_blank",
          "width=600,height=400"
        );
      },
      color: "text-blue-700",
    },
    {
      name: "Email",
      icon: Mail,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(productName)}&body=${encodeURIComponent(shareText + "\n" + shareUrl)}`;
      },
      color: "text-red-500",
    },
    {
      name: "Copy Link",
      icon: Copy,
      action: handleCopyLink,
      color: "text-gray-600",
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-steel-700 text-steel-300 hover:bg-steel-800 hover:text-steel-100 transition-colors text-sm font-body"
        title="Share this product"
      >
        <Share2 size={16} />
        <span className="hidden sm:inline">Share</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-steel-900 border border-steel-700 rounded-lg shadow-lg z-50 p-3 w-60">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-display font-700 uppercase tracking-widest text-steel-400">
              Share Product
            </p>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-steel-800 rounded transition-colors"
              type="button"
            >
              <X size={14} className="text-steel-400" />
            </button>
          </div>

          <div className="space-y-2">
            {shareOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.name}
                  onClick={() => {
                    option.action();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-steel-800 transition-colors text-sm text-steel-300 hover:text-steel-100"
                  type="button"
                >
                  <Icon size={16} className={option.color} />
                  <span>{option.name}</span>
                </button>
              );
            })}
          </div>

          {/* Product URL Preview */}
          <div className="mt-3 pt-3 border-t border-steel-700">
            <p className="text-xs text-steel-500 mb-2 font-mono break-all">{shareUrl}</p>
          </div>
        </div>
      )}
    </div>
  );
}
