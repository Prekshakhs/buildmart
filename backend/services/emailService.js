const { transporter } = require("../config/email");

const emailService = {
  sendVerificationEmail: async (user, token) => {
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    const mailOptions = {
      from: process.env.GMAIL_USER || "noreply@pickmytools.com",
      to: user.email,
      subject: "Verify Your PickMyTools Email 📧",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e2e3e;">Welcome to PickMyTools!</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>Thank you for registering. Please verify your email to activate your account.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 30px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
          <p style="color: #999; font-size: 12px;">This link expires in 24 hours.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">PickMyTools Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ Verification email sent to ${user.email}`);
    } catch (error) {
      console.error("Error sending verification email:", error);
      throw error;
    }
  },

  sendPasswordResetEmail: async (user, token) => {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.GMAIL_USER || "noreply@pickmytools.com",
      to: user.email,
      subject: "Reset Your PickMyTools Password 🔐",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e2e3e;">Password Reset Request</h2>
          <p>Hi <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your password. Click the link below to create a new password.</p>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy this link: <a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #999; font-size: 12px;">This link expires in 1 hour.</p>
          <p style="color: #d32f2f; font-size: 14px;"><strong>⚠️ If you didn't request this, please ignore this email.</strong></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">PickMyTools Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ Password reset email sent to ${user.email}`);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      throw error;
    }
  },

  sendSecurityAlert: async (user, alertType, details = {}) => {
    let subject, html;

    switch (alertType) {
      case "login":
        subject = "🔐 New Login to Your PickMyTools Account";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e2e3e;">New Login Detected</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your account was just logged in from:</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <p><strong>IP Address:</strong> ${details.ip || "Unknown"}</p>
              <p><strong>Device:</strong> ${details.device || "Unknown"}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #d32f2f;"><strong>⚠️ If this wasn't you, </strong><a href="${process.env.CLIENT_URL}/change-password">change your password immediately</a></p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">PickMyTools Team</p>
          </div>
        `;
        break;

      case "failed_login":
        subject = "⚠️ Multiple Failed Login Attempts";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #d32f2f;">Failed Login Attempts Detected</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We detected ${details.attempts || 5} failed login attempts on your account.</p>
            <div style="background: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #d32f2f;">
              <p style="color: #d32f2f;"><strong>Your account has been locked for 30 minutes for security.</strong></p>
            </div>
            <p>If this was you, try logging in after 30 minutes.</p>
            <p style="color: #d32f2f;"><strong>If this wasn't you, </strong><a href="${process.env.CLIENT_URL}/forgot-password">reset your password</a></p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">PickMyTools Team</p>
          </div>
        `;
        break;

      case "password_changed":
        subject = "🔐 Your Password Was Changed";
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e2e3e;">Password Changed</h2>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Your password was successfully changed on ${new Date().toLocaleString()}.</p>
            <p>All your active sessions have been logged out for security.</p>
            <p style="color: #d32f2f;"><strong>⚠️ If you didn't make this change, </strong><a href="${process.env.CLIENT_URL}/forgot-password">reset your password immediately</a></p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            <p style="color: #999; font-size: 12px;">PickMyTools Team</p>
          </div>
        `;
        break;

      default:
        return;
    }

    const mailOptions = {
      from: process.env.GMAIL_USER || "noreply@pickmytools.com",
      to: user.email,
      subject,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ Security alert (${alertType}) sent to ${user.email}`);
    } catch (error) {
      console.error("Error sending security alert:", error);
      throw error;
    }
  },

  sendContactConfirmation: async (options) => {
    const { email, name, contactId } = options;

    const mailOptions = {
      from: process.env.GMAIL_USER || "noreply@pickmytools.com",
      to: email,
      subject: "We Received Your Message - PickMyTools Support",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e2e3e;">Thank You for Contacting Us</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>We have received your message and will review it shortly. Our support team will get back to you within 24-48 hours.</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Reference ID:</strong> ${contactId}</p>
            <p>Keep this ID handy for tracking your request.</p>
          </div>
          <p>If you have any urgent matters, please feel free to reply to this email.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">PickMyTools Support Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ Contact confirmation sent to ${email}`);
    } catch (error) {
      console.error("Error sending contact confirmation:", error);
      throw error;
    }
  },

  notifyAdminNewContact: async (options) => {
    const { contactId, name, email, subject, category } = options;
    const adminEmail = process.env.GMAIL_USER;

    if (!adminEmail) {
      console.error("Admin email not configured");
      return;
    }

    const mailOptions = {
      from: process.env.GMAIL_USER || "noreply@pickmytools.com",
      to: adminEmail,
      subject: `[${category}] New Support Request from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e2e3e;">New Support Contact Received</h2>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Contact ID:</strong> ${contactId}</p>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Subject:</strong> ${subject}</p>
          </div>
          <p>
            <a href="${process.env.CLIENT_URL}/admin/contacts/${contactId}" style="display: inline-block; padding: 10px 20px; background: #fbbf24; color: #0f1820; text-decoration: none; border-radius: 5px; font-weight: bold;">
              View Contact
            </a>
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">PickMyTools Admin System</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ New contact notification sent to admin`);
    } catch (error) {
      console.error("Error sending admin notification:", error);
    }
  },

  sendContactReply: async (options) => {
    const { email, name, subject, message, contactId } = options;

    const mailOptions = {
      from: process.env.GMAIL_USER || "noreply@pickmytools.com",
      to: email,
      subject: `Re: ${subject} - PickMyTools Support`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e2e3e;">Support Reply</h2>
          <p>Hi <strong>${name}</strong>,</p>
          <p>We have a response to your support request:</p>
          <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #fbbf24;">
            <p>${message.replace(/\n/g, "<br/>")}</p>
          </div>
          <p>If you have any follow-up questions, please reply to this email with your reference ID: <strong>${contactId}</strong></p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px;">PickMyTools Support Team</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`✉️ Support reply sent to ${email}`);
    } catch (error) {
      console.error("Error sending support reply:", error);
      throw error;
    }
  },
};

module.exports = emailService;
