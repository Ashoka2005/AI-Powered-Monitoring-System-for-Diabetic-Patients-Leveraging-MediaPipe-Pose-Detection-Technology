const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const User = require('../models/User');
const ExerciseSession = require('../models/ExerciseSession');
const HealthRecord = require('../models/HealthRecord');
const Appointment = require('../models/Appointment');
const Alert = require('../models/Alert');
const router = express.Router();

// Get doctor's patients
router.get('/patients', protect, authorize('doctor'), async (req, res) => {
  try {
    const { page = 1, limit = 20, search, scope = 'my' } = req.query;
    const filter = { role: 'patient' };
    if (scope === 'my') {
      filter['patientInfo.doctorId'] = req.user._id;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const patients = await User.find(filter)
      .select('firstName lastName email avatar profile patientInfo')
      .sort({ firstName: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);
    const totalPlatformPatients = await User.countDocuments({ role: 'patient' });
    const myPatientsCount = await User.countDocuments({ role: 'patient', 'patientInfo.doctorId': req.user._id });

    res.json({
      success: true,
      data: patients,
      totalPlatformPatients,
      myPatientsCount,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get patient detail (for doctor)
router.get('/patients/:id', protect, authorize('doctor'), async (req, res) => {
  try {
    const patient = await User.findById(req.params.id).select('-password -refreshToken');
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [recentHealthRecords, recentExercises, recentAlerts, upcomingAppointment] = await Promise.all([
      HealthRecord.find({ userId: patient._id, recordedAt: { $gte: thirtyDaysAgo } }).sort({ recordedAt: -1 }).limit(20),
      ExerciseSession.find({ userId: patient._id, createdAt: { $gte: thirtyDaysAgo } })
        .populate('exerciseId', 'name category')
        .sort({ createdAt: -1 })
        .limit(10),
      Alert.find({ userId: patient._id, resolved: false }).sort({ createdAt: -1 }).limit(5),
      Appointment.findOne({ patientId: patient._id, doctorId: req.user._id, status: { $in: ['pending', 'confirmed'] }, date: { $gte: new Date() } }).sort({ date: 1 }),
    ]);

    res.json({
      success: true,
      data: { patient, recentHealthRecords, recentExercises, recentAlerts, upcomingAppointment },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Patient health summary (for doctor)
router.get('/patients/:id/summary', protect, authorize('doctor'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [bloodSugarRecords, exerciseStats, alerts] = await Promise.all([
      HealthRecord.find({ userId: req.params.id, metricType: { $in: ['fasting', 'postprandial', 'random'] }, recordedAt: { $gte: since } }).sort({ recordedAt: 1 }),
      ExerciseSession.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId(req.params.id), createdAt: { $gte: since } } },
        { $group: { _id: null, totalSessions: { $sum: 1 }, totalDuration: { $sum: '$duration' }, avgAccuracy: { $avg: '$accuracyScore' } } },
      ]),
      Alert.countDocuments({ userId: req.params.id, createdAt: { $gte: since } }),
    ]);

    const sugarValues = bloodSugarRecords.map((r) => r.value);
    const avgSugar = sugarValues.length ? (sugarValues.reduce((a, b) => a + b, 0) / sugarValues.length).toFixed(1) : 'N/A';
    const timeInRange = sugarValues.length ? ((sugarValues.filter((v) => v >= 70 && v <= 180).length / sugarValues.length) * 100).toFixed(0) : 'N/A';

    res.json({
      success: true,
      data: {
        bloodSugar: { average: avgSugar, timeInRange: `${timeInRange}%`, totalReadings: sugarValues.length, trend: bloodSugarRecords },
        exercise: exerciseStats[0] || { totalSessions: 0, totalDuration: 0, avgAccuracy: 0 },
        alertCount: alerts,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add doctor notes for patient
router.post('/patients/:id/notes', protect, authorize('doctor'), async (req, res) => {
  try {
    const { notes, prescription } = req.body;
    const patient = await User.findById(req.params.id);
    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

    // Store notes in appointment or create a health record note
    await HealthRecord.create({
      userId: patient._id,
      metricType: 'weight', // using as carrier for notes
      value: 0,
      unit: 'note',
      notes: notes,
      source: 'manual',
    });

    res.json({ success: true, message: 'Notes added successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
