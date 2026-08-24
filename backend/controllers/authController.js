const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { JWT_SECRET } = require("../middleware/auth");

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Generate signed JWT
 */
function generateToken(id, role) {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
async function signup(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Please provide name, email, and password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long",
      });
    }

    const validRoles = ["researcher", "policymaker", "admin"];
    const userRole = role && validRoles.includes(role.toLowerCase()) ? role.toLowerCase() : "researcher";

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        error: "An account with this email address already exists",
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: userRole,
    });

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: "Account registered successfully",
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Please provide email and password",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: "Logged in successfully",
      user: user.toJSON(),
      token,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Bearer token)
 */
async function getMe(req, res) {
  res.status(200).json({
    user: req.user.toJSON(),
  });
}

/**
 * @desc    Update user profile (name, email)
 * @route   PUT /api/auth/profile
 * @access  Private (Bearer token)
 */
async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "Name cannot be empty",
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        error: "Email cannot be empty",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        error: "Please provide a valid email address",
      });
    }

    // Check if email changed and is already taken
    if (normalizedEmail !== req.user.email) {
      const existingUser = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: req.user._id },
      });
      if (existingUser) {
        return res.status(400).json({
          error: "An account with this email address already exists",
        });
      }
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name.trim();
    user.email = normalizedEmail;
    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Update user password
 * @route   PUT /api/auth/password
 * @access  Private (Bearer token)
 */
async function updatePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Please provide both current and new password",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long",
      });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        error: "Current password does not match",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Upload or set user profile picture (avatar)
 * @route   POST /api/auth/avatar
 * @access  Private (Bearer token)
 */
async function uploadAvatar(req, res, next) {
  try {
    let avatarUrl = "";

    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    } else if (req.body.avatar && typeof req.body.avatar === "string") {
      avatarUrl = req.body.avatar.trim();
    }

    if (!avatarUrl) {
      return res.status(400).json({
        error: "Please provide an image file or avatar URL",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Clean up previous avatar if it was stored locally
    if (user.avatar && user.avatar.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(__dirname, "..", user.avatar.replace(/^\//, ""));
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          if (err) console.warn("Failed to delete old avatar file:", err.message);
        });
      }
    }

    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: user.toJSON(),
      avatar: avatarUrl,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Remove user profile picture (avatar)
 * @route   DELETE /api/auth/avatar
 * @access  Private (Bearer token)
 */
async function removeAvatar(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Clean up local avatar file if exists
    if (user.avatar && user.avatar.startsWith("/uploads/avatars/")) {
      const oldPath = path.join(__dirname, "..", user.avatar.replace(/^\//, ""));
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          if (err) console.warn("Failed to delete old avatar file:", err.message);
        });
      }
    }

    user.avatar = "";
    await user.save();

    res.status(200).json({
      message: "Profile picture removed successfully",
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * @desc    Quick one-click demo login for rapid testing
 * @route   POST /api/auth/demo
 * @access  Public
 */
async function demoLogin(req, res, next) {
  try {
    const { role } = req.body;
    const requestedRole = role === "policymaker" ? "policymaker" : "researcher";

    const demoProfiles = {
      researcher: {
        name: "Dr. Maya Sharma (Research Lead)",
        email: "demo.researcher@thalassagis.io",
        password: "DemoPassword123!",
        role: "researcher",
      },
      policymaker: {
        name: "Rohan Patel (Marine Fisheries Director)",
        email: "demo.policymaker@thalassagis.io",
        password: "DemoPassword123!",
        role: "policymaker",
      },
    };

    const profile = demoProfiles[requestedRole];
    let user = await User.findOne({ email: profile.email });

    if (!user) {
      user = await User.create(profile);
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: `Signed in as Demo ${requestedRole === "policymaker" ? "Policy Maker" : "Researcher"}`,
      user: user.toJSON(),
      token,
      isDemo: true,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  signup,
  login,
  getMe,
  updateProfile,
  updatePassword,
  uploadAvatar,
  removeAvatar,
  demoLogin,
};

