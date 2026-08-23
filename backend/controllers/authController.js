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
  demoLogin,
};
