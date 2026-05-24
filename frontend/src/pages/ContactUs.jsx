import React, { useState } from "react";
import { Mail, Send, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "react-toastify";
import { contactService } from "../api/services";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "General",
  "Account",
  "Product",
  "Payment",
  "Technical",
  "Other",
];

export default function ContactUs() {
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
    category: "General",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (formData.subject.length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.length > 5000) {
      newErrors.message = "Message cannot exceed 5000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);
    try {
      await contactService.submit(formData);
      setSubmitted(true);
      toast.success("Thank you! We will get back to you soon.");

      // Reset form after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          subject: "",
          message: "",
          category: "General",
        });
      }, 3000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to submit. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="page-container">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-8 text-center">
            <CheckCircle
              size={64}
              className="mx-auto mb-4 text-green-400"
            />
            <h2 className="text-2xl font-semibold text-green-400 mb-2">
              Message Sent Successfully!
            </h2>
            <p className="text-steel-400 mb-2">
              Thank you for contacting PickMyTools. We appreciate your message.
            </p>
            <p className="text-steel-500 text-sm">
              Our support team will review your request and get back to you
              within 24-48 hours via email.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-display font-800 text-4xl uppercase text-steel-50 mb-2">
          Contact Us
        </h1>
        <p className="text-steel-400">
          Have a question? We'd love to hear from you. Send us a message!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-steel-900 border border-steel-800 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Mail size={24} className="text-amber-400" />
              <h3 className="text-lg font-semibold text-steel-50">Email</h3>
            </div>
            <p className="text-steel-400 text-sm break-all">
              support@buildmart.com
            </p>
          </div>

          <div className="bg-steel-900 border border-steel-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-steel-50 mb-3">
              Response Time
            </h3>
            <p className="text-steel-400 text-sm">
              We typically respond to all inquiries within 24-48 hours during
              business days.
            </p>
          </div>

          <div className="bg-steel-900 border border-steel-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-steel-50 mb-3">
              Quick Help
            </h3>
            <p className="text-steel-400 text-sm mb-3">
              Check our Help Center for instant answers:
            </p>
            <a
              href="/help-center"
              className="inline-block px-4 py-2 bg-amber-400 text-steel-950 rounded-lg font-semibold hover:bg-amber-300 transition-colors text-sm"
            >
              Visit Help Center
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-steel-900 border border-steel-800 rounded-lg p-8">
            {/* Name */}
            <div className="mb-6">
              <label className="label">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                className="input"
              />
              {errors.name && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="mb-6">
              <label className="label">Email Address *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className="input"
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="mb-6">
              <label className="label">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input"
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label className="label">Subject *</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is this about?"
                className="input"
              />
              {errors.subject && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {errors.subject}
                </p>
              )}
            </div>

            {/* Message */}
            <div className="mb-6">
              <label className="label">Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                rows="6"
                maxLength="5000"
                className="input resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                {errors.message && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {errors.message}
                  </p>
                )}
                <span className="text-xs text-steel-500 ml-auto">
                  {formData.message.length}/5000
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-400 hover:bg-amber-300 text-steel-950 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-steel-950 border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Message
                </>
              )}
            </button>

            <p className="text-xs text-steel-500 text-center mt-4">
              Required fields are marked with *
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
