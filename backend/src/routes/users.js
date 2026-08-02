const express = require('express');
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Get current user profile
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('patientInfo.doctorId', 'firstName lastName email doctorInfo');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update profile
router.put('/me', protect, async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar', 'pushToken'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Handle nested profile updates without wiping sibling fields
    if (req.body.profile) {
      Object.keys(req.body.profile).forEach((key) => {
        if (req.body.profile[key] !== undefined) {
          // If it is emergencyContact or address, map their nested fields too
          if (typeof req.body.profile[key] === 'object' && req.body.profile[key] !== null && !Array.isArray(req.body.profile[key]) && !(req.body.profile[key] instanceof Date)) {
            Object.keys(req.body.profile[key]).forEach((subKey) => {
              updates[`profile.${key}.${subKey}`] = req.body.profile[key][subKey];
            });
          } else {
            updates[`profile.${key}`] = req.body.profile[key];
          }
        }
      });
    }

    // Handle nested patientInfo updates without wiping sibling fields
    if (req.body.patientInfo) {
      Object.keys(req.body.patientInfo).forEach((key) => {
        if (req.body.patientInfo[key] !== undefined) {
          updates[`patientInfo.${key}`] = req.body.patientInfo[key];
        }
      });
    }

    // Handle nested doctorInfo updates without wiping sibling fields
    if (req.body.doctorInfo) {
      Object.keys(req.body.doctorInfo).forEach((key) => {
        if (req.body.doctorInfo[key] !== undefined) {
          updates[`doctorInfo.${key}`] = req.body.doctorInfo[key];
        }
      });
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get BMI
router.get('/bmi', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const bmi = user.bmi;
    let category = 'N/A';
    if (bmi) {
      if (bmi < 18.5) category = 'Underweight';
      else if (bmi < 25) category = 'Normal';
      else if (bmi < 30) category = 'Overweight';
      else category = 'Obese';
    }
    res.json({ success: true, data: { bmi, category, height: user.profile?.height, weight: user.profile?.weight } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update IoT devices
router.put('/iot-devices', protect, async (req, res) => {
  try {
    const { iotDevices } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { iotDevices }, { new: true });
    res.json({ success: true, data: user.iotDevices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
