const express = require('express');
const mongoose = require('mongoose');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const ExerciseSession = require('../models/ExerciseSession');
const HealthRecord = require('../models/HealthRecord');
const Appointment = require('../models/Appointment');
const Alert = require('../models/Alert');
const User = require('../models/User');
const router = express.Router();

// Patient analytics dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    const userId = req.query.userId || req.user._id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [exerciseStats, healthRecords, upcomingAppointments, recentAlerts, recentSessions] = await Promise.all([
      ExerciseSession.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId.toString()), createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: null,
            totalSessions: { $sum: 1 },
            totalDuration: { $sum: '$duration' },
            totalCalories: { $sum: '$caloriesBurned' },
            avgAccuracy: { $avg: '$accuracyScore' },
          },
        },
      ]),
      HealthRecord.find({ userId, recordedAt: { $gte: thirtyDaysAgo } }).sort({ recordedAt: -1 }).limit(10),
      Appointment.find({ patientId: userId, date: { $gte: new Date() }, status: { $in: ['pending', 'confirmed'] } })
        .populate('doctorId', 'firstName lastName doctorInfo')
        .limit(5),
      Alert.find({ userId, resolved: false }).sort({ createdAt: -1 }).limit(5),
      ExerciseSession.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('exerciseId', 'name slug category thumbnail'),
    ]);

    // Weekly exercise trend
    const weeklyTrend = await ExerciseSession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId.toString()), createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          sessions: { $sum: 1 },
          calories: { $sum: '$caloriesBurned' },
          avgAccuracy: { $avg: '$accuracyScore' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Blood sugar trend
    const bloodSugarTrend = await HealthRecord.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId.toString()), metricType: { $in: ['fasting', 'postprandial', 'random'] }, recordedAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$recordedAt' } }, avgSugar: { $avg: '$value' }, readings: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        exerciseStats: exerciseStats[0] || { totalSessions: 0, totalDuration: 0, totalCalories: 0, avgAccuracy: 0 },
        recentHealthRecords: healthRecords,
        upcomingAppointments,
        recentAlerts,
        recentSessions,
        weeklyExerciseTrend: weeklyTrend,
        bloodSugarTrend,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Admin analytics
router.get('/admin', protect, authorize('admin'), async (req, res) => {
  try {
    const [totalUsers, totalPatients, totalDoctors, totalSessions, totalAlerts, activeUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'patient' }),
      User.countDocuments({ role: 'doctor' }),
      ExerciseSession.countDocuments(),
      Alert.countDocuments(),
      User.countDocuments({ isActive: true }),
    ]);

    // User growth by month
    const userGrowth = await User.aggregate([
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 12 },
    ]);

    // Most popular exercises
    const popularExercises = await ExerciseSession.aggregate([
      { $group: { _id: '$exerciseId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'exercises', localField: '_id', foreignField: '_id', as: 'exercise' } },
      { $unwind: '$exercise' },
      { $project: { name: '$exercise.name', count: 1 } },
    ]);

    res.json({
      success: true,
      data: { totalUsers, totalPatients, totalDoctors, totalSessions, totalAlerts, activeUsers, userGrowth, popularExercises },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
