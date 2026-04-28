const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// ─── Cloudinary Config (re-used from config/cloudinary.js) ───────────────────
// This middleware file is a convenience wrapper so routes can simply do:
// const upload = require("../middleware/uploadMiddleware");
// upload.array("images", 5)

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "marketplace/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 800, height: 800, crop: "limit", quality: "auto:good" },
    ],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpg, jpeg, png, webp)"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB per file
    files: 5,                   // max 5 files per request
  },
  fileFilter,
});

module.exports = upload;
