const AuthRouter = require("express").Router();
const UserModel = require("../model/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { verifyToken } = require("../middleware/auth.middleware");
// const sendEmail = require("../config/nodemailer");
const sendMail = require("../config/resend");

// Health check endpoint to verify server is running
AuthRouter.get("/", async (_, res) => {
  return res.status(200).json({
    message: "Authentication API is operational",
    success: true,
  });
});

// User registration endpoint
AuthRouter.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  if (role && !["user", "owner"].includes(role)) {
    return res.status(400).json({
      message: "Invalid role specified",
      success: false,
    });
  }

  try {
    // Check if email already exists in database
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
        success: false,
      });
    }

    // Check if username already exists in database
    const existingName = await UserModel.findOne({ name });
    if (existingName) {
      return res.status(400).json({
        message: "Username already exists",
        success: false,
      });
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user document in database
    const user = await UserModel.create({
      name,
      email,
      role,
      password: hashedPassword,
      recentSearchRestaurants: [],
    });

    return res.status(201).json({
      message: "Register successfully",
      success: true,
      data: { name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Account creation failed due to server error",
      success: false,
      error: error.message,
    });
  }
});

// User login endpoint
AuthRouter.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: "Both email and password are required",
      success: false,
    });
  }

  try {
    // Find user by email and include password field (normally excluded)
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({
        message: "User not found. Please Sign up and Login",
        success: false,
      });
    }

    // Compare provided password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid Password",
        success: false,
      });
    }

    // Generate JWT token with user ID and role
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES,
      }
    );

    return res.status(200).json({
      message: "Login Successfully",
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token: token,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      success: false,
      error: error.message,
    });
  }
});

// Password reset request endpoint
AuthRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      message: "Email address is required",
      success: false,
    });
  }
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      // Return generic message for security (don't reveal if email exists)
      return res.status(400).json({
        message: "If this email exists, a reset link has been sent",
        success: false,
      });
    }

    // Generate cryptographically secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

    // Store reset token and expiry in database
    await UserModel.updateOne(
      { _id: user._id },
      { resetToken, resetTokenExpiry }
    );

    // Construct password reset URL for frontend
    const RESET_URL = `${
      process.env.FRONTEND_URL
    }/reset-password?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    try {
      // Send password reset email using nodemailer
      await sendMail({
        from: {
          name: "DineArea Security",
          address: process.env.EMAIL_USER,
        },
        to: user.email,
        subject: "Password Reset Request for Your DineArea Account",
        text: `Dear ${user.name || "Valued Guest"},

We received a request to reset your DineArea account password. Please use this link to proceed:

${RESET_URL}

This link expires in 15 minutes. If you didn't make this request, please contact our support team immediately.

Best regards,
The DineArea Team`.trim(),
        html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DineArea Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 25px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #000000;
            margin-bottom: 10px;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #2b6cb0;
              color: white !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            font-weight: bold;
            margin: 15px 0;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
            text-align: center;
        }
        .warning {
            background-color: #fffaf0;
            border-left: 4px solid #dd6b20;
            padding: 12px;
            margin: 20px 0;
            border-radius: 0 4px 4px 0;
        }
        .details {
            margin: 15px 0;
            line-height: 1.8;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">DineArea</div>
        <h2 style="color: #000000; margin: 0;">Password Reset Request</h2>
    </div>
    
    <p>Hello ${user.name || "Valued Guest"},</p>
    
    <p>We received a request to reset the password for your DineArea account. Click the button below to create a new password:</p>
    
    <div style="text-align: center;">
        <a href="${RESET_URL}" class="button">Reset Password</a>
    </div>
    
    <div class="warning">
        <strong>Important:</strong> This password reset link will expire in <strong>15 minutes</strong> for your security.
    </div>
    
    <div class="content">
        <h3 style="margin-top: 0;">Account Details:</h3>
        <div class="details">
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Request Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>Expiration:</strong> ${new Date(
              Date.now() + 15 * 60000
            ).toLocaleString()}</p>
        </div>
    </div>
    
    <p>If you didn't request this password reset, please ignore this email or contact our support team to secure your account.</p>
    
    <div class="footer">
        <p>Thank you,<br>The DineArea Team</p>
        <p>© ${new Date().getFullYear()} DineArea. All rights reserved.</p>
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>`,
        headers: {
          "X-Priority": "1",
          Importance: "high",
          "X-MSMail-Priority": "High",
          "X-Mailer": "Nodemailer",
        },
      });
    } catch (error) {
      console.error("Error sending password reset email:", error);
    }

    return res.status(200).json({
      message: "Password reset link sent to your email",
      success: true,
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Email sending error:", error);
    return res.status(500).json({
      message: "Password reset service unavailable",
      success: false,
      error: error.message,
    });
  }
});

// Password reset confirmation endpoint
AuthRouter.post("/reset-password", async (req, res) => {
  const { email, resetToken, newPassword } = req.body;
  if (!email || !resetToken || !newPassword) {
    return res.status(400).json({
      message: "All fields are required: email, reset token, and new password",
      success: false,
    });
  }
  try {
    // Find user with valid, non-expired reset token
    const user = await UserModel.findOne({
      email,
      resetToken,
      resetTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
        success: false,
      });
    }

    // Hash new password and clear reset token fields
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await UserModel.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      }
    );
    return res.status(200).json({
      message: "Password reset successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Password reset service unavailable",
      success: false,
      error: error.message,
    });
  }
});

// Reset token validation endpoint
AuthRouter.get("/validate-resetToken/:resetToken", async (req, res) => {
  const { resetToken } = req.params;
  const { email } = req.query;

  if (!resetToken || !email) {
    return res.status(400).json({
      valid: false,
      message: "Reset token and email are required",
    });
  }

  try {
    // Verify reset token is valid and not expired
    const user = await UserModel.findOne({
      email: decodeURIComponent(email),
      resetToken,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(401).json({
        valid: false,
        message: "Invalid or expired reset token",
      });
    }

    return res.status(200).json({
      valid: true,
      message: "Reset token is valid",
    });
  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(500).json({
      valid: false,
      message: "Server error during token validation",
    });
  }
});

// Get current user profile endpoint
AuthRouter.get("/user/me", verifyToken, async (req, res) => {
  try {
    const _id = req.user._id;
    // Find user by ID and exclude password field
    const user = await UserModel.findById(_id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "User fetched successfully",
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        recentSearchRestaurants: user.recentSearchRestaurants,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
});

// Store recent restaurant searches endpoint
AuthRouter.post("/recent-search", verifyToken, async (req, res) => {
  try {
    const { recentSearchDining } = req.body;
    const user = await UserModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Initialize array if it doesn't exist
    if (!user.recentSearchRestaurants) {
      user.recentSearchRestaurants = [];
    }

    // Check if search already exists (compare objects properly)
    const existingIndex = user.recentSearchRestaurants.findIndex(
      (search) =>
        search.city === recentSearchDining.city &&
        search.cuisine === recentSearchDining.cuisine &&
        search.price === recentSearchDining.price
    );

    // Remove existing duplicate
    if (existingIndex !== -1) {
      user.recentSearchRestaurants.splice(existingIndex, 1);
    }

    // Add new search to the end
    user.recentSearchRestaurants.push(recentSearchDining);

    // Keep only last 3 searches (FIFO behavior)
    if (user.recentSearchRestaurants.length > 3) {
      user.recentSearchRestaurants = user.recentSearchRestaurants.slice(-3);
    }

    await user.save();

    return res.status(200).json({
      message: "Search saved successfully",
      success: true,
      data: user.recentSearchRestaurants,
    });
  } catch (error) {
    console.error("Error storing recent search:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
});

// User logout endpoint
AuthRouter.post("/logout", verifyToken, async (req, res) => {
  try {
    const _id = req.user.id;
    // Clear refresh token from database (client-side JWT remains until expiry)
    await UserModel.updateOne({ _id }, { $set: { refreshToken: null } });
    return res.status(200).json({
      message: "Logout Successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error logging out:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
});

module.exports = AuthRouter;
