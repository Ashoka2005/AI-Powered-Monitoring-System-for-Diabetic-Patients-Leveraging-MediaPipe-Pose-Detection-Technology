const express = require('express');
const { protect } = require('../middleware/auth');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const router = express.Router();

// Book appointment
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, date, timeSlot, type, reason, symptoms } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(400).json({ success: false, message: 'Invalid doctor' });
    }

    // Check slot availability
    const existing = await Appointment.findOne({
      doctorId,
      date: new Date(date),
      'timeSlot.startTime': timeSlot.startTime,
      status: { $in: ['pending', 'confirmed'] },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Time slot already booked' });
    }

    const appointment = await Appointment.create({
      patientId: req.user._id,
      doctorId,
      date: new Date(date),
      timeSlot,
      type: type || 'video',
      reason,
      symptoms: symptoms || [],
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user appointments
router.get('/', protect, async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const filter = {};

    if (req.user.role === 'patient') {
      filter.patientId = req.user._id;
    } else if (req.user.role === 'doctor') {
      filter.doctorId = req.user._id;
    }

    if (status) filter.status = status;
    if (upcoming === 'true') {
      filter.date = { $gte: new Date() };
      filter.status = { $in: ['pending', 'confirmed'] };
    }

    const appointments = await Appointment.find(filter)
      .populate('patientId', 'firstName lastName email phone avatar')
      .populate('doctorId', 'firstName lastName email doctorInfo avatar')
      .sort({ date: -1 });

    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single appointment
router.get('/:id', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'firstName lastName email phone profile')
      .populate('doctorId', 'firstName lastName email doctorInfo');

    if (!appointment) return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update appointment status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status, cancellationReason, prescription, notes } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });

    appointment.status = status;
    if (status === 'cancelled') appointment.cancelledBy = req.user._id;
    if (cancellationReason) appointment.cancellationReason = cancellationReason;
    if (prescription) appointment.prescription = prescription;
    if (notes) appointment.notes = notes;

    await appointment.save();
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Rate appointment
router.put('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ success: false, message: 'Not found' });
    if (appointment.patientId.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });

    appointment.rating = rating;
    appointment.review = review;
    await appointment.save();

    // Update doctor rating
    const avgRating = await Appointment.aggregate([
      { $match: { doctorId: appointment.doctorId, rating: { $exists: true, $gt: 0 } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    if (avgRating[0]) {
      await User.findByIdAndUpdate(appointment.doctorId, { 'doctorInfo.rating': Math.round(avgRating[0].avgRating * 10) / 10 });
    }

    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get available doctors
router.get('/doctors/available', protect, async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor', isActive: true }).select(
      'firstName lastName email avatar doctorInfo'
    );
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
