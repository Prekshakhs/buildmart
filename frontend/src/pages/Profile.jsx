import React, { useState, useEffect } from "react";
import { User, MapPin, Lock, Settings, AlertCircle, Smartphone, Clock } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageLoader, ErrorMessage } from "../components/Loaders";
import ProfilePictureUpload from "../components/ProfilePictureUpload";
import ProfileEditor from "../components/ProfileEditor";
import AddressManager from "../components/AddressManager";
import SellerProfileSection from "../components/SellerProfileSection";
import ChangePasswordModal from "../components/ChangePasswordModal";
import ActiveSessions from "../components/ActiveSessions";
import LoginHistory from "../components/LoginHistory";
import { profileService } from "../api/services";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getProfile();
      setProfileData(response.data.user);
      setError(null);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedUser) => {
    setProfileData(updatedUser);
    updateUser(updatedUser);
  };

  const handleAvatarUpdate = (avatarUrl) => {
    const updated = { ...profileData, avatar: avatarUrl };
    setProfileData(updated);
    updateUser(updated);
  };

  if (loading && !profileData) return <PageLoader />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-800 text-4xl uppercase text-steel-50 mb-2">
          My Profile
        </h1>
        <p className="text-steel-400">
          Manage your account settings and preferences
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Profile Picture & Quick Info */}
        <div className="lg:col-span-1">
          <div className="bg-steel-900 border border-steel-800 rounded-lg p-6 space-y-4 sticky top-6">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden mb-3">
                {profileData?.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  profileData?.name?.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-lg font-semibold text-steel-100">
                {profileData?.name}
              </h2>
              <p className="text-xs text-steel-500 capitalize">
                {profileData?.role}
              </p>
            </div>

            <div className="divider" />

            {/* Quick Stats */}
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-steel-500 uppercase tracking-widest mb-1">
                  Email
                </p>
                <p className="text-steel-300 break-all text-xs">
                  {profileData?.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-steel-500 uppercase tracking-widest mb-1">
                  Phone
                </p>
                <p className="text-steel-300">
                  {profileData?.phone || "Not provided"}
                </p>
              </div>
              {profileData?.role === "seller" &&
                profileData?.sellerInfo?.isApproved && (
                  <div>
                    <span className="inline-block px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded border border-emerald-500/30">
                      ✓ Approved Seller
                    </span>
                  </div>
                )}
            </div>

            <div className="divider" />

            {/* Tab Navigation */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full px-3 py-2 rounded text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-2 ${
                  activeTab === "profile"
                    ? "bg-amber-500 text-white"
                    : "bg-steel-800 text-steel-300 hover:bg-steel-700"
                }`}
                type="button"
              >
                <User size={14} />
                Edit Profile
              </button>
              <button
                onClick={() => setActiveTab("address")}
                className={`w-full px-3 py-2 rounded text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-2 ${
                  activeTab === "address"
                    ? "bg-amber-500 text-white"
                    : "bg-steel-800 text-steel-300 hover:bg-steel-700"
                }`}
                type="button"
              >
                <MapPin size={14} />
                Addresses
              </button>
              {profileData?.role === "seller" && (
                <button
                  onClick={() => setActiveTab("seller")}
                  className={`w-full px-3 py-2 rounded text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-2 ${
                    activeTab === "seller"
                      ? "bg-amber-500 text-white"
                      : "bg-steel-800 text-steel-300 hover:bg-steel-700"
                  }`}
                  type="button"
                >
                  <Settings size={14} />
                  Business
                </button>
              )}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full px-3 py-2 rounded text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-2 bg-steel-800 text-steel-300 hover:bg-steel-700"
                type="button"
              >
                <Lock size={14} />
                Password
              </button>
              <button
                onClick={() => setActiveTab("sessions")}
                className={`w-full px-3 py-2 rounded text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-2 ${
                  activeTab === "sessions"
                    ? "bg-amber-500 text-white"
                    : "bg-steel-800 text-steel-300 hover:bg-steel-700"
                }`}
                type="button"
              >
                <Smartphone size={14} />
                Sessions
              </button>
              <button
                onClick={() => setActiveTab("loginHistory")}
                className={`w-full px-3 py-2 rounded text-xs font-semibold uppercase tracking-wide transition-colors flex items-center gap-2 ${
                  activeTab === "loginHistory"
                    ? "bg-amber-500 text-white"
                    : "bg-steel-800 text-steel-300 hover:bg-steel-700"
                }`}
                type="button"
              >
                <Clock size={14} />
                Login History
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="bg-steel-900 border border-steel-800 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-display font-700 text-steel-100 mb-4">
                  Profile Picture
                </h3>
                <ProfilePictureUpload
                  currentAvatar={profileData?.avatar}
                  onAvatarUpdate={handleAvatarUpdate}
                />
              </div>

              <div className="divider" />

              <div>
                <h3 className="text-lg font-display font-700 text-steel-100 mb-4">
                  Basic Information
                </h3>
                <ProfileEditor
                  profileData={profileData}
                  onProfileUpdate={handleProfileUpdate}
                />
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === "address" && (
            <div className="bg-steel-900 border border-steel-800 rounded-lg p-6">
              <h3 className="text-lg font-display font-700 text-steel-100 mb-4">
                Delivery Addresses
              </h3>
              <AddressManager
                currentAddress={profileData?.address}
                onAddressUpdate={handleProfileUpdate}
              />
            </div>
          )}

          {/* Seller Info Tab */}
          {activeTab === "seller" && profileData?.role === "seller" && (
            <div className="bg-steel-900 border border-steel-800 rounded-lg p-6">
              <h3 className="text-lg font-display font-700 text-steel-100 mb-4">
                Business Information
              </h3>
              <SellerProfileSection
                sellerInfo={profileData?.sellerInfo}
                onUpdate={handleProfileUpdate}
              />
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="bg-steel-900 border border-steel-800 rounded-lg p-6">
              <ActiveSessions />
            </div>
          )}

          {/* Login History Tab */}
          {activeTab === "loginHistory" && (
            <div className="bg-steel-900 border border-steel-800 rounded-lg p-6">
              <h3 className="text-lg font-display font-700 text-steel-100 mb-6">
                Login History
              </h3>
              <LoginHistory />
            </div>
          )}
        </div>
      </div>

      {/* Password Modal */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
