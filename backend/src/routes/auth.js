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
      const normalizedEmail = (req.body.email || '').toLowerCase().trim();

      // Check if email already registered
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }

      // Generate 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Save to database (upsert to handle re-sending)
      await Otp.findOneAndUpdate(
        { email: normalizedEmail },
        { code: otpCode, createdAt: new Date() },
        { upsert: true, new: true }
      );

      console.log(`\n======================================================`);
      console.log(`🔑 [OTP Verification] Email: ${normalizedEmail}`);
      console.log(`🔑 [OTP Code]: ${otpCode}`);
      console.log(`======================================================\n`);

      // Send Email with 6-digit verification OTP
      await sendEmail({
        to: normalizedEmail,
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
      });

      res.json({
        success: true,
        message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please check your email inbox.`
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
      const normalizedEmail = (req.body.email || '').toLowerCase().trim();
      const code = (req.body.code || '').trim();

      // Require exact OTP code generated and stored in database
      const otpDoc = await Otp.findOne({ email: normalizedEmail, code });
      if (!otpDoc) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
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
    body('otp').optional(),
    body('phone').optional(),
    body('role').optional().isIn(['patient', 'doctor', 'admin']).withMessage('Invalid role'),
  ],
  validate,
  async (req, res) => {
    try {
      const { firstName, lastName, password, role, phone, profession, emergencyContactName, emergencyContactPhone, emergencyContactEmail, emergencyContactRelationship, diabetesType } = req.body;
      const normalizedEmail = (req.body.email || '').toLowerCase().trim();
      const otp = (req.body.otp || '').trim();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already registered. Please sign in.' });
      }

      // If OTP was provided, verify it
      if (otp) {
        const otpDoc = await Otp.findOne({ email: normalizedEmail, code: otp });
        if (!otpDoc) {
          return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
        }
        await Otp.deleteOne({ email: normalizedEmail });
      }

      const user = await User.create({
        firstName,
        lastName,
        email: normalizedEmail,
        password,
        role: role || 'patient',
        phone: phone || '',
        profile: {
          profession: profession || '',
          emergencyContact: {
            name: emergencyContactName || '',
            phone: emergencyContactPhone || '',
            email: emergencyContactEmail || '',
            relationship: emergencyContactRelationship || ''
          }
        },
        patientInfo: {
          diabetesType: diabetesType || ''
        }
      });

      // Delete verified OTP
      await Otp.deleteOne({ email: normalizedEmail });

      const token = user.generateToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      try {
        await user.save();
      } catch (saveErr) {
        console.warn('User save warning (continuing with active token):', saveErr.message);
      }

      // Dispatch real welcome email to user's registered inbox (max 2.5s non-blocking race)
      try {
        await Promise.race([
          sendEmail({
            to: normalizedEmail,
            subject: '🎉 Welcome to DiaFit AI - Your Diabetic Rehabilitation Partner',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <h2 style="color: #2563eb; text-align: center; margin-bottom: 20px;">Welcome to DiaFit AI!</h2>
                <p>Hello <strong>${firstName} ${lastName}</strong>,</p>
                <p>Your DiaFit AI patient account has been created successfully. You can now access your personalized exercise coaching, real-time posture analysis, glycemic forecasting, and customized diabetic diet plans.</p>
                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
                  <p style="margin: 0 0 8px 0;"><strong>Account Email:</strong> ${normalizedEmail}</p>
                  <p style="margin: 0 0 8px 0;"><strong>Role:</strong> ${role || 'Patient'}</p>
                  <p style="margin: 0;"><strong>Emergency Safety Contact:</strong> ${emergencyContactEmail || 'Configured'}</p>
                </div>
                <p>Get started by visiting the <strong>AI Exercise Room</strong> to begin your personalized exercises.</p>
                <br/>
                <p>Best regards,<br/><strong>DiaFit AI Healthcare Team</strong></p>
              </div>
            `
          }),
          new Promise((resolve) => setTimeout(resolve, 2500))
        ]);
      } catch (err) {
        console.warn('Welcome email warning (non-blocking):', err.message);
      }

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user._id,
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phone: user.phone || '',
            profile: user.profile || {},
            patientInfo: user.patientInfo || {}
          },
          token,
          refreshToken,
        },
      });
    } catch (error) {
      console.error('[Registration Error]:', error.message);
      if (error.code === 11000) {
        return res.status(409).json({ success: false, message: 'Email already registered. Please sign in.' });
      }
      res.status(500).json({ success: false, message: error.message || 'Registration failed' });
    }
  }
);

// Send Login OTP (Email verification code for personal email login)
router.post(
  '/login-send-otp',
  [body('email').isEmail().withMessage('Valid email is required')],
  validate,
  async (req, res) => {
    try {
      const normalizedEmail = (req.body.email || '').toLowerCase().trim();
      const password = req.body.password;

      // Check if user exists
      let user = await User.findOne({ email: normalizedEmail }).select('+password');
      if (user && !user.isActive) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated' });
      }

      // If password is provided, verify it
      if (user && password) {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
        }
      }

      // Generate 6-digit OTP code
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Upsert to Otp collection
      await Otp.findOneAndUpdate(
        { email: normalizedEmail },
        { code: otpCode, createdAt: new Date() },
        { upsert: true, new: true }
      );

      const displayName = user ? user.firstName : 'Patient';

      console.log(`\n======================================================`);
      console.log(`🔑 [LOGIN OTP] Email: ${normalizedEmail} (User: ${displayName})`);
      console.log(`🔑 [LOGIN OTP Code]: ${otpCode}`);
      console.log(`======================================================\n`);

      // Dispatch Email with 6-digit verification code
      await sendEmail({
        to: normalizedEmail,
        subject: 'DiaFit AI - Your Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">DiaFit AI Healthcare</h2>
              <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Smart Diabetes Health & Exercise Monitoring</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;" />
            <p style="color: #334155; font-size: 15px;">Hello <strong>${displayName}</strong>,</p>
            <p style="color: #334155; font-size: 15px; line-height: 1.5;">Your one-time verification code to access DiaFit AI is:</p>
            <div style="background: linear-gradient(135deg, #eef2ff, #f5f3ff); border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4338ca;">${otpCode}</span>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in 10 minutes. If you did not initiate this request, you can safely ignore this email.</p>
            <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-top: 24px; margin-bottom: 16px;" />
            <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">&copy; DiaFit AI Healthcare. All rights reserved.</p>
          </div>
        `,
      });

      res.json({
        success: true,
        requireOtp: true,
        isNewUser: !user,
        message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please check your email inbox.`
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Verify Login OTP
router.post(
  '/login-verify-otp',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits'),
  ],
  validate,
  async (req, res) => {
    try {
      const normalizedEmail = (req.body.email || '').toLowerCase().trim();
      const code = (req.body.code || '').trim();

      // Require exact OTP code generated and stored in database
      const otpDoc = await Otp.findOne({ email: normalizedEmail, code });
      if (!otpDoc) {
        return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
      }

      let user = await User.findOne({ email: normalizedEmail });
      let isNewUser = false;

      // Auto-create user account if logging in for the first time
      if (!user) {
        const crypto = require('crypto');
        const rawPrefix = normalizedEmail.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        const firstName = rawPrefix ? (rawPrefix.charAt(0).toUpperCase() + rawPrefix.slice(1)) : 'Patient';

        user = await User.create({
          firstName,
          lastName: 'User',
          email: normalizedEmail,
          password: crypto.randomBytes(16).toString('hex'),
          role: 'patient',
          profile: {
            emergencyContact: {
              name: '',
              phone: '',
              email: '',
              relationship: ''
            }
          },
          patientInfo: {
            diabetesType: ''
          }
        });
        isNewUser = true;
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated' });
      }

      // Delete verified OTP
      await Otp.deleteOne({ email: normalizedEmail });

      const token = user.generateToken();
      const refreshToken = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save();

      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 7 * 24 * 60 * 60 * 1000 });

      const hasEmergencyEmail = Boolean(user.profile?.emergencyContact?.email);
      const hasDiabetesData = Boolean(user.patientInfo?.diabetesType);
      const profileCompleted = Boolean(hasEmergencyEmail && hasDiabetesData);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            profile: user.profile,
            patientInfo: user.patientInfo,
          },
          token,
          refreshToken,
          isNewUser,
          profileCompleted,
        },
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
);

// Login (supports email OR phone number + password, or OTP)
router.post(
  '/login',
  [body('email').notEmpty().withMessage('Valid email or phone number is required'), body('password').notEmpty().withMessage('Password is required')],
  validate,
  async (req, res) => {
    try {
      const identifier = (req.body.email || '').trim();
      const { password, otp, sendOtp } = req.body;

      let user;
      if (identifier.includes('@')) {
        user = await User.findOne({ email: identifier.toLowerCase() }).select('+password');
      } else {
        user = await User.findOne({ phone: identifier }).select('+password');
      }

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect email/phone or password.' });
      }

      if (!user.isActive) {
        return res.status(403).json({ success: false, message: 'Account has been deactivated' });
      }

      // If client requests OTP verification before logging in
      const normalizedEmail = (user.email || identifier).toLowerCase().trim();
      if (sendOtp) {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        await Otp.findOneAndUpdate(
          { email: normalizedEmail },
          { code: otpCode, createdAt: new Date() },
          { upsert: true, new: true }
        );

        console.log(`\n======================================================`);
        console.log(`🔑 [LOGIN OTP] User: ${user.firstName} (${normalizedEmail})`);
        console.log(`🔑 [LOGIN OTP Code]: ${otpCode}`);
        console.log(`======================================================\n`);

        const emailSent = await sendEmail({
          to: normalizedEmail,
          subject: 'DiaFit AI - Login Verification Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">DiaFit AI Healthcare</h2>
                <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Smart Diabetes Health & Exercise Monitoring</p>
              </div>
              <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 24px;" />
              <p style="color: #334155; font-size: 15px;">Hello <strong>${user.firstName}</strong>,</p>
              <p style="color: #334155; font-size: 15px; line-height: 1.5;">You requested to sign in to your DiaFit AI account. Please use the following 6-digit verification code to complete your login:</p>
              <div style="background: linear-gradient(135deg, #eef2ff, #f5f3ff); border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #4338ca;">${otpCode}</span>
              </div>
              <p style="color: #64748b; font-size: 13px; line-height: 1.5;">This code will expire in 10 minutes.</p>
            </div>
          `,
        });

        return res.json({
          success: true,
          requireOtp: true,
          message: `Verification code sent to ${normalizedEmail}. Please check your inbox.`
        });
      }

      // If OTP was provided with credentials, verify it
      if (otp) {
        const otpDoc = await Otp.findOne({ email: normalizedEmail, code: otp.trim() });
        if (!otpDoc) {
          return res.status(400).json({ success: false, message: 'Invalid or expired verification code' });
        }
        await Otp.deleteOne({ email: normalizedEmail });
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
            patientInfo: user.patientInfo,
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

    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'diafit-ai-refresh-secret-2024-change-in-production';
    const decoded = jwt.verify(refreshToken, refreshSecret);
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
      const jwtSecret = process.env.JWT_SECRET || 'diafit-ai-dev-secret-key-2024-change-in-production';
      const decoded = jwt.verify(token, jwtSecret);
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

    const jwtSecret = process.env.JWT_SECRET || 'diafit-ai-dev-secret-key-2024-change-in-production';
    const resetToken = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
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
      const jwtSecret = process.env.JWT_SECRET || 'diafit-ai-dev-secret-key-2024-change-in-production';
      const decoded = jwt.verify(req.body.token, jwtSecret);
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
