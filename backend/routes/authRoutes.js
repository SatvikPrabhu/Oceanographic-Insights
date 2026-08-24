const express = require("express");
const {
  signup,
  login,
  getMe,
  updateProfile,
  updatePassword,
  uploadAvatar,
  removeAvatar,
  demoLogin,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { avatarUpload } = require("../middleware/upload");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/demo", demoLogin);
router.post("/demo-login", demoLogin);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.post("/avatar", protect, avatarUpload.single("avatar"), uploadAvatar);
router.delete("/avatar", protect, removeAvatar);

module.exports = router;

