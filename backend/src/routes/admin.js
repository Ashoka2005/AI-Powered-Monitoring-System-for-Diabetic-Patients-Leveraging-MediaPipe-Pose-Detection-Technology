const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const User = require('../models/User');
const Exercise = require('../models/Exercise');
const router = express.Router();

// Get all users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-refreshToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);
    res.json({ success: true, data: users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user status
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { isActive, role } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password -refreshToken');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Manage exercises
router.post('/exercises', protect, authorize('admin'), async (req, res) => {
  try {
    const exercise = await Exercise.create(req.body);
    res.status(201).json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/exercises/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const exercise = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: exercise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.delete('/exercises/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Exercise.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Exercise deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// System stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const ExerciseSession = require('../models/ExerciseSession');
    const Appointment = require('../models/Appointment');
    const Alert = require('../models/Alert');
    const HealthRecord = require('../models/HealthRecord');

    const stats = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      ExerciseSession.countDocuments(),
      Appointment.countDocuments(),
      Alert.countDocuments({ resolved: false }),
      HealthRecord.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: stats[0],
        totalPatients: stats[1],
        totalDoctors: stats[2],
        totalExerciseSessions: stats[3],
        totalAppointments: stats[4],
        unresolvedAlerts: stats[5],
        totalHealthRecords: stats[6],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
