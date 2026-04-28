import React, { useState } from "react";

export function SellerProfile({ seller }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!seller) {
    return null;
  }

  const getApprovalBadge = (isApproved) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          ✓ Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
        ⏳ Pending Approval
      </span>
    );
  };

  const formatAddress = (address) => {
    if (!address) return "Not provided";
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pincode) parts.push(address.pincode);
    return parts.length > 0 ? parts.join(", ") : "Not provided";
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
      >
        <h3 className="text-lg font-bold text-gray-900">Shop Profile</h3>
        <span className="text-2xl">{isExpanded ? "−" : "+"}</span>
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="border-t px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-4">
                Business Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Business Name
                  </p>
                  <p className="text-gray-900 font-medium">
                    {seller.sellerInfo?.businessName || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    GSTIN
                  </p>
                  <p className="text-gray-900 font-medium">
                    {seller.sellerInfo?.gstin || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Status
                  </p>
                  <div className="mt-1">
                    {getApprovalBadge(seller.sellerInfo?.isApproved)}
                  </div>
                </div>
              </div>
            </div>

            {/* Contact & Address Info */}
            <div>
              <h4 className="text-sm font-semibold text-gray-600 mb-4">
                Contact & Location
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Contact Email
                  </p>
                  <p className="text-gray-900 font-medium">{seller.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Phone
                  </p>
                  <p className="text-gray-900 font-medium">
                    {seller.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Shop Address
                  </p>
                  <p className="text-gray-900 font-medium">
                    {formatAddress(seller.address)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Note */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-gray-500">
              💡 To update your shop profile or business details, please contact support.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
