const ContactSubmission = require("../models/ContactSubmission.model");
const emailService = require("../services/emailService");
const asyncHandler = require("express-async-handler");

// ─── @POST /api/contact ─────────────────────────────────────────────────────────
const submitContact = asyncHandler(async (req, res) => {
  const { name, email, subject, message, category } = req.body;

  // Validation
  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error("Name, email, subject, and message are required");
  }

  if (message.length < 10) {
    res.status(400);
    throw new Error("Message must be at least 10 characters long");
  }

  // Create contact submission
  const contact = await ContactSubmission.create({
    name,
    email,
    subject,
    message,
    category: category || "General",
    userId: req.user?._id || null,
  });

  try {
    // Send confirmation email to user
    await emailService.sendContactConfirmation({
      email,
      name,
      contactId: contact._id,
    });

    // Notify admin
    await emailService.notifyAdminNewContact({
      contactId: contact._id,
      name,
      email,
      subject,
      category,
    });
  } catch (error) {
    console.error("Error sending contact emails:", error);
  }

  res.status(201).json({
    success: true,
    message:
      "Thank you for contacting us! We will get back to you soon via email.",
    data: {
      contactId: contact._id,
      email: contact.email,
    },
  });
});

// ─── ADMIN ENDPOINTS ────────────────────────────────────────────────────────────

// ─── @GET /api/admin/contacts ───────────────────────────────────────────────────
const getContacts = asyncHandler(async (req, res) => {
  const { status, category, priority, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (priority) query.priority = priority;

  const skip = (page - 1) * limit;

  const contacts = await ContactSubmission.find(query)
    .populate("userId", "name email")
    .populate("replies.respondedBy", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ContactSubmission.countDocuments(query);
  const pages = Math.ceil(total / limit);

  res.json({
    success: true,
    data: contacts,
    pagination: { total, page: parseInt(page), pages, limit: parseInt(limit) },
  });
});

// ─── @GET /api/admin/contacts/:id ───────────────────────────────────────────────
const getContactById = asyncHandler(async (req, res) => {
  const contact = await ContactSubmission.findById(req.params.id)
    .populate("userId", "name email")
    .populate("replies.respondedBy", "name email")
    .populate("resolvedBy", "name email");

  if (!contact) {
    res.status(404);
    throw new Error("Contact submission not found");
  }

  // Mark as viewed if new
  if (contact.status === "new") {
    contact.status = "viewed";
    await contact.save();
  }

  res.json({
    success: true,
    data: contact,
  });
});

// ─── @PATCH /api/admin/contacts/:id/status ──────────────────────────────────────
const updateContactStatus = asyncHandler(async (req, res) => {
  const { status, priority } = req.body;

  const contact = await ContactSubmission.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact submission not found");
  }

  if (status) {
    if (!["new", "viewed", "in_progress", "resolved"].includes(status)) {
      res.status(400);
      throw new Error("Invalid status");
    }
    contact.status = status;

    if (status === "resolved") {
      contact.resolvedAt = new Date();
      contact.resolvedBy = req.user._id;
    }
  }

  if (priority) {
    if (!["low", "medium", "high"].includes(priority)) {
      res.status(400);
      throw new Error("Invalid priority");
    }
    contact.priority = priority;
  }

  await contact.save();

  res.json({
    success: true,
    message: "Contact status updated successfully",
    data: contact,
  });
});

// ─── @POST /api/admin/contacts/:id/reply ────────────────────────────────────────
const replyToContact = asyncHandler(async (req, res) => {
  const { message, isInternal } = req.body;

  if (!message) {
    res.status(400);
    throw new Error("Reply message is required");
  }

  const contact = await ContactSubmission.findById(req.params.id);
  if (!contact) {
    res.status(404);
    throw new Error("Contact submission not found");
  }

  // Add reply
  contact.replies.push({
    message,
    respondedBy: req.user._id,
    isInternal: isInternal || false,
  });

  // Mark as in_progress if not internal reply
  if (!isInternal && contact.status === "new") {
    contact.status = "in_progress";
  }

  await contact.save();

  // Send reply email to user if not internal
  if (!isInternal) {
    try {
      await emailService.sendContactReply({
        email: contact.email,
        name: contact.name,
        subject: contact.subject,
        message,
        contactId: contact._id,
      });
    } catch (error) {
      console.error("Error sending reply email:", error);
    }
  }

  res.json({
    success: true,
    message: isInternal
      ? "Internal note added successfully"
      : "Reply sent successfully",
    data: contact,
  });
});

// ─── @GET /api/admin/contacts/stats ─────────────────────────────────────────────
const getContactStats = asyncHandler(async (req, res) => {
  const stats = await ContactSubmission.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const categoryStats = await ContactSubmission.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await ContactSubmission.countDocuments();
  const newCount = await ContactSubmission.countDocuments({ status: "new" });

  res.json({
    success: true,
    data: {
      total,
      newCount,
      statusStats: stats,
      categoryStats,
    },
  });
});

module.exports = {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  replyToContact,
  getContactStats,
};
