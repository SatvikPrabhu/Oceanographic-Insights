const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { HttpError } = require("./errorHandler");

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.memoryStorage();

const MAX_FILE_BYTES = 25 * 1024 * 1024;

function extensionOf(filename = "") {
  return path.extname(filename).toLowerCase();
}

function csvOnly(_req, file, cb) {
  if (extensionOf(file.originalname) === ".csv") {
    return cb(null, true);
  }
  cb(new HttpError("Only .csv files are allowed", 400));
}

function csvOrFasta(_req, file, cb) {
  const ext = extensionOf(file.originalname);
  if ([".csv", ".fasta", ".fa", ".fna", ".fas"].includes(ext)) {
    return cb(null, true);
  }
  cb(new HttpError("Only .csv or FASTA files (.fasta, .fa, .fna, .fas) are allowed", 400));
}

const csvUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: csvOnly,
});

const ednaUpload = multer({
  storage,
  limits: { fileSize: MAX_FILE_BYTES, files: 1 },
  fileFilter: csvOrFasta,
});

const avatarsDir = path.join(uploadsDir, "avatars");
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const avatarDiskStorage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, avatarsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || ".png";
    const uniqueName = `avatar-${req.user ? req.user._id : Date.now()}-${Date.now()}${ext}`;
    cb(null, uniqueName);
  },
});

function imageOnly(_req, file, cb) {
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
  const ext = extensionOf(file.originalname);
  if (allowedExts.includes(ext) || file.mimetype.startsWith("image/")) {
    return cb(null, true);
  }
  cb(new HttpError("Only image files (.jpg, .jpeg, .png, .webp, .gif, .svg) are allowed", 400));
}

const avatarUpload = multer({
  storage: avatarDiskStorage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }, // 5MB limit
  fileFilter: imageOnly,
});

function requireFile(req, _res, next) {
  if (!req.file) {
    return next(new HttpError("No file uploaded. Use multipart field name \"file\".", 400));
  }
  next();
}

function requireAvatarFile(req, _res, next) {
  if (!req.file && !req.body.avatar) {
    return next(new HttpError("No avatar file or image data provided", 400));
  }
  next();
}

module.exports = {
  csvUpload,
  ednaUpload,
  avatarUpload,
  requireFile,
  requireAvatarFile,
};

