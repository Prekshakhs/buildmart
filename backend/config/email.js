const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const emailTemplates = {
  order_placed: (user, data) => ({
    subject: "Order Placed Successfully! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2e3e;">Order Confirmed!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your order <strong>#${data.orderNumber}</strong> has been placed successfully!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Order Details:</strong></p>
          <p>Total Amount: <strong>₹${data.grandTotal}</strong></p>
          <p>Items: ${data.itemCount}</p>
        </div>
        <p>We'll keep you updated on your shipment status.</p>
        <a href="${process.env.CLIENT_URL}/orders/${data.orderId}" style="display: inline-block; padding: 10px 20px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Order</a>
        <p style="color: #999; margin-top: 30px; font-size: 12px;">PickMyTools Team</p>
      </div>
    `,
  }),

  order_shipped: (user, data) => ({
    subject: "Your Order is On the Way! 🚚",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2e3e;">Order Shipped!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Great news! Your order <strong>#${data.orderNumber}</strong> has been shipped.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Tracking Information:</strong></p>
          <p>Estimated Delivery: <strong>${data.estimatedDelivery || "3-5 business days"}</strong></p>
        </div>
        <p>You can track your order in real-time on our platform.</p>
        <a href="${process.env.CLIENT_URL}/orders/${data.orderId}" style="display: inline-block; padding: 10px 20px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; margin-top: 20px;">Track Order</a>
        <p style="color: #999; margin-top: 30px; font-size: 12px;">PickMyTools Team</p>
      </div>
    `,
  }),

  order_delivered: (user, data) => ({
    subject: "Your Order Has Arrived! ✅",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2e3e;">Order Delivered!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your order <strong>#${data.orderNumber}</strong> has been delivered successfully! 🎁</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Items Delivered:</strong></p>
          <p>${data.itemCount} item(s)</p>
        </div>
        <p>Please inspect the items and let us know if you need any assistance.</p>
        <p style="margin-top: 20px;"><strong>Not satisfied?</strong> You can initiate a return within 30 days.</p>
        <a href="${process.env.CLIENT_URL}/orders/${data.orderId}" style="display: inline-block; padding: 10px 20px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Order</a>
        <p style="color: #999; margin-top: 30px; font-size: 12px;">PickMyTools Team</p>
      </div>
    `,
  }),

  return_initiated: (user, data) => ({
    subject: "Return Request Received 📦",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2e3e;">Return Request Initiated</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your return request for order <strong>#${data.orderNumber}</strong> has been received.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Return Details:</strong></p>
          <p>Item: ${data.productName}</p>
          <p>Refund Amount: <strong>₹${data.refundAmount}</strong></p>
          <p>Reason: ${data.reason}</p>
        </div>
        <p>The seller will review your request within 2-3 business days.</p>
        <a href="${process.env.CLIENT_URL}/returns" style="display: inline-block; padding: 10px 20px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Returns</a>
        <p style="color: #999; margin-top: 30px; font-size: 12px;">PickMyTools Team</p>
      </div>
    `,
  }),

  return_approved: (user, data) => ({
    subject: "Your Return Has Been Approved! ✅",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2e3e;">Return Approved</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Great news! Your return request has been <strong>approved</strong>.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Next Steps:</strong></p>
          <p>1. Ship the item back to the seller</p>
          <p>2. Provide tracking ID in the app</p>
          <p>3. Receive refund after item inspection</p>
          <p><strong>Refund Amount: ₹${data.refundAmount}</strong></p>
        </div>
        <a href="${process.env.CLIENT_URL}/returns" style="display: inline-block; padding: 10px 20px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Return Details</a>
        <p style="color: #999; margin-top: 30px; font-size: 12px;">PickMyTools Team</p>
      </div>
    `,
  }),

  return_rejected: (user, data) => ({
    subject: "Return Request Status Update ℹ️",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2e3e;">Return Request Update</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your return request for order <strong>#${data.orderNumber}</strong> has been <strong>declined</strong> by the seller.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Item:</strong> ${data.productName}</p>
          <p>If you believe this is incorrect, please contact our support team.</p>
        </div>
        <a href="${process.env.CLIENT_URL}/returns" style="display: inline-block; padding: 10px 20px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Returns</a>
        <p style="color: #999; margin-top: 30px; font-size: 12px;">PickMyTools Team</p>
      </div>
    `,
  }),

  return_refunded: (user, data) => ({
    subject: "Your Refund Has Been Processed! 💰",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2e3e;">Refund Processed</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your return has been completed! Your refund has been processed.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Refund Details:</strong></p>
          <p>Amount: <strong>₹${data.refundAmount}</strong></p>
          <p>The amount will be credited to your original payment method within 5-7 business days.</p>
        </div>
        <p>Thank you for shopping with PickMyTools!</p>
        <p style="color: #999; margin-top: 30px; font-size: 12px;">PickMyTools Team</p>
      </div>
    `,
  }),

  payment_confirmed: (user, data) => ({
    subject: "Payment Confirmed ✅",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2e3e;">Payment Successful</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Your payment has been confirmed successfully!</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Payment Details:</strong></p>
          <p>Transaction ID: <strong>${data.transactionId}</strong></p>
          <p>Amount: <strong>₹${data.amount}</strong></p>
          <p>Status: Confirmed</p>
        </div>
        <p>Your order is being prepared for shipment.</p>
        <a href="${process.env.CLIENT_URL}/orders/${data.orderId}" style="display: inline-block; padding: 10px 20px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; margin-top: 20px;">View Order</a>
        <p style="color: #999; margin-top: 30px; font-size: 12px;">PickMyTools Team</p>
      </div>
    `,
  }),

  account_registered: (user, data) => ({
    subject: "Welcome to PickMyTools! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1e2e3e;">Welcome!</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>Welcome to PickMyTools! Your account has been created successfully.</p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Account Details:</strong></p>
          <p>Email: ${user.email}</p>
          <p>Role: ${user.role}</p>
        </div>
        <p>Start exploring our wide range of products today!</p>
        <a href="${process.env.CLIENT_URL}/products" style="display: inline-block; padding: 10px 20px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; margin-top: 20px;">Browse Products</a>
        <p style="color: #999; margin-top: 30px; font-size: 12px;">PickMyTools Team</p>
      </div>
    `,
  }),
};

module.exports = {
  transporter,
  emailTemplates,
};
