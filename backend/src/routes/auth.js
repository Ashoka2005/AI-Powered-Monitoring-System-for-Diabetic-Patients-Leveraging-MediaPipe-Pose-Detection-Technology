const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendEmail } = require('../utils/email');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Send OTP
router.post(
  '/send-otp',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  async (req, res) => {
    try {
      const { email } = req.body;

      // Check if email already registered
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      // Generate 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Save to database (upsert to handle re-sending)
      await Otp.findOneAndUpdate(
        { email },
        { code: otpCode, createdAt: new Date() },
        { upsert: true, new: true }
      );

      console.log(`[OTP Verification] Generated code ${otpCode} for email ${email}`);

      // Send Email (Run asynchronously in the background so the API response isn't delayed by SMTP firewall block/timeout)
      sendEmail({
        to: email,
        subject: 'DiaFit AI - Email Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <h2 style="color: #4f46e5; text-align: center; margin-bottom: 20px;">DiaFit AI Healthcare</h2>
            <hr style="border: 0; border-top: 1px solid #eaeaea; margin-bottom: 20px;" />
            <p>Hello,</p>
            <p>Thank you for signing up with DiaFit AI. Please use the following 6-digit verification code to complete your registration:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <span style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1f2937;">${otpCode}</span>
            </div>
            <p style="color: #6b7280; font-size: 12px;">This code is valid for 10 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `,
      }).catch(err => console.error('SMTP background delivery error:', err.message));

      res.json({
        success: true,
        message: 'Verification code sent to email'
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
  ],
  validate,
  async (req, res) => {
    try {
      const { email, code } = req.body;

      // Allow 123456 as a master bypass code for testing/development deployments
      if (code !== '123456') {
        const otpDoc = await Otp.findOne({ email, code });
        if (!otpDoc) {
          return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
        }
      }

      res.json({ success: true, message: 'Email verified successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Register
router.post(
  '/register',
  [
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit OTP verification code is required'),
    body('role').optional().isIn(['patient', 'doctor', 'admin']).withMessage('Invalid role'),
  ],
  validate,
  async (req, res) => {
    try {
      const { firstName, lastName, email, password, role, phone, otp, profession, emergencyContactName, emergencyContactPhone, emergencyContactEmail, emergencyContactRelationship } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      // Verify OTP document exists (Allow 123456 as a master bypass code for testing/development deployments)
      if (otp !== '123456') {
        const otpDoc = await Otp.findOne({ email, code: otp });
        if (!otpDoc) {
          return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
        }
      }

      const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role: role || 'patient',
        phone,
        profile: {
          profession: profession || '',
          emergencyContact: {
            name: emergencyContactName || '',
            phone: emergencyContactPhone || '',
            email: emergencyContactEmail || '',
            relationship: emergencyContactRelationship || ''
          }
        },
      });

      // Delete verified OTP
      await Otp.deleteOne({ _id: otpDoc._id });

      const token = user.generateToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.status(201).json({
        success: true,
        data: {
          user: { id: user._id, firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Login
router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated' });
      }

      const token = user.generateToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.json({
        success: true,
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            profile: user.profile,
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Refresh Token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newToken = user.generateToken();
    const newRefreshToken = user.generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({ success: true, data: { token: newToken, refreshToken: newRefreshToken } });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      await User.findByIdAndUpdate(decoded.id, { refreshToken: null });
    }
    res.clearCookie('token');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.json({ success: true, message: 'Logged out' });
  }
});

// Forgot Password
router.post('/forgot-password', [body('email').isEmail()], validate, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // In production, send email with reset link containing resetToken
    res.json({ success: true, message: 'Password reset link sent to email', resetToken }); // resetToken in dev only
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reset Password
router.post(
  '/reset-password',
  [body('token').notEmpty(), body('password').isLength({ min: 8 })],
  validate,
  async (req, res) => {
    try {
      const decoded = jwt.verify(req.body.token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('+password');
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid reset token' });
      }
      user.password = req.body.password;
      await user.save();
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }
  }
);

module.exports = router;
