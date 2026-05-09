const Notification = require("../models/Notification.model");
const User = require("../models/User.model");
const { transporter, emailTemplates } = require("../config/email");

const notificationService = {
  /**
   * Main notification orchestrator
   * Sends notification through enabled channels based on user preferences
   */
  notify: async (userId, type, data) => {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Extract category from type (e.g., 'order_placed' -> 'orders')
      const category = type.split("_")[0] + "s"; // order -> orders, return -> returns, etc.
      const prefs = user.notificationPreferences?.[category];

      if (!prefs) return;

      // Create in-app notification if enabled
      if (prefs.inApp) {
        await notificationService.createInAppNotification(userId, type, data);
      }

      // Send email if enabled
      if (prefs.email) {
        await notificationService.sendEmail(user, type, data);
      }

      // Send push if enabled (Phase 3)
      if (prefs.push) {
        // TODO: Implement push notifications with Firebase
        // await notificationService.sendPush(userId, title, message);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  },

  /**
   * Create in-app notification in database
   */
  createInAppNotification: async (userId, type, data) => {
    try {
      const template = notificationService.getTemplate(type);
      const notification = await Notification.create({
        userId,
        type,
        title: template.title,
        message: template.message(data),
        metadata: data,
        channels: { email: false, inApp: true, push: false },
      });
      return notification;
    } catch (error) {
      console.error("Error creating in-app notification:", error);
    }
  },

  /**
   * Send email notification
   */
  sendEmail: async (user, type, data) => {
    try {
      const emailTemplate = emailTemplates[type];
      if (!emailTemplate) return;

      const { subject, html } = emailTemplate(user, data);

      await transporter.sendMail({
        from: process.env.GMAIL_USER || "noreply@buildmart.com",
        to: user.email,
        subject,
        html,
      });

      console.log(`✉️ Email sent to ${user.email} - Type: ${type}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  },

  /**
   * Send push notification (placeholder for Phase 3)
   */
  sendPush: async (userId, title, message) => {
    try {
      // TODO: Implement Firebase Cloud Messaging
      // const deviceTokens = await UserDeviceToken.find({ userId });
      // for (const token of deviceTokens) {
      //   await firebase.messaging().send({...});
      // }
    } catch (error) {
      console.error("Error sending push notification:", error);
    }
  },

  /**
   * Get notification template by type
   */
  getTemplate: (type) => {
    const templates = {
      order_placed: {
        title: "Order Placed",
        message: (data) => `Your order #${data.orderNumber} has been placed!`,
      },
      order_shipped: {
        title: "Order Shipped",
        message: (data) => `Your order #${data.orderNumber} is on the way!`,
      },
      order_delivered: {
        title: "Order Delivered",
        message: (data) => `Your order #${data.orderNumber} has been delivered!`,
      },
      order_cancelled: {
        title: "Order Cancelled",
        message: (data) => `Your order #${data.orderNumber} has been cancelled.`,
      },
      return_initiated: {
        title: "Return Request Received",
        message: (data) => `Your return request for ${data.productName} has been received.`,
      },
      return_approved: {
        title: "Return Approved",
        message: (data) => `Your return for ${data.productName} has been approved!`,
      },
      return_rejected: {
        title: "Return Declined",
        message: (data) => `Your return for ${data.productName} has been declined.`,
      },
      return_refunded: {
        title: "Refund Processed",
        message: (data) => `Your refund of ₹${data.refundAmount} has been processed!`,
      },
      payment_confirmed: {
        title: "Payment Confirmed",
        message: (data) => `Payment of ₹${data.amount} confirmed!`,
      },
      payment_refunded: {
        title: "Refund Processed",
        message: (data) => `Refund of ₹${data.amount} has been processed.`,
      },
      account_registered: {
        title: "Welcome!",
        message: (data) => `Welcome to BuildMart, ${data.userName}!`,
      },
      password_reset: {
        title: "Password Reset",
        message: (data) => `Your password reset link has been sent to your email.`,
      },
    };
    return templates[type] || { title: "Notification", message: () => "New notification" };
  },
};

module.exports = notificationService;
