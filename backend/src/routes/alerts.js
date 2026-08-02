const express = require('express');
const { protect } = require('../middleware/auth');
const Alert = require('../models/Alert');
const router = express.Router();

// Create alert (e.g., fall detection)
router.post('/', protect, async (req, res) => {
  try {
    const { type, severity, title, message, data, location } = req.body;
    const alert = await Alert.create({
      userId: req.user._id,
      type,
      severity: severity || 'medium',
      title,
      message,
      data,
      location,
    });

    // Auto-notify emergency contacts strictly
    if (type === 'fall_detected' || type === 'user_absent' || severity === 'critical') {
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      const contact = user.profile?.emergencyContact;
      console.log('[DEBUG ALERT ROUTE] User profile emergencyContact:', contact);
      console.log('[DEBUG ALERT ROUTE] Entire user profile:', user.profile);
      
      const recipients = [];

      // 1. Primary Emergency Contact (if configured)
      if (contact && contact.email) {
        recipients.push({
          email: contact.email,
          name: contact.name || 'Emergency Contact',
          role: 'Primary Emergency Contact'
        });
        alert.notifiedContacts.push({
          name: contact.name || 'Emergency Contact',
          phone: contact.phone || '',
          email: contact.email || '',
          notifiedAt: new Date(),
          method: 'email',
        });
      }

      // 2. Assigned Doctor Physician (if configured)
      if (user.patientInfo?.doctorId) {
        const doctor = await User.findById(user.patientInfo.doctorId);
        if (doctor && doctor.email) {
          recipients.push({
            email: doctor.email,
            name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            role: 'Assigned Healthcare Practitioner'
          });
          alert.notifiedContacts.push({
            name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
            phone: doctor.phone || '',
            email: doctor.email,
            notifiedAt: new Date(),
            method: 'email',
          });
        }
      }

      await alert.save();

      // Dispatch alert emails to all resolved recipients
      for (const recipient of recipients) {
        try {
          const { sendEmail } = require('../utils/email');
          const addressString = location?.address || (location?.latitude && location?.longitude ? `GPS: Lat ${typeof location.latitude === 'number' ? location.latitude.toFixed(6) : location.latitude}, Lon ${typeof location.longitude === 'number' ? location.longitude.toFixed(6) : location.longitude}` : 'Unknown location');
          const mapsLink = location?.latitude && location?.longitude ? `<br/><a href="https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}" target="_blank" style="color: #0747a6; text-decoration: underline; font-weight: bold;">Open in Google Maps 📍</a>` : '';
          
          let age = 'N/A';
          if (user.profile?.dateOfBirth) {
            const diff = Date.now() - new Date(user.profile.dateOfBirth).getTime();
            age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
          }
          
          const exerciseName = data?.exerciseName || 'Unknown Exercise';
          const startTime = data?.sessionStartTime || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          const alertTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          const duration = data?.duration || '10 seconds';

          let incidentSubject = `Patient Not Detected`;
          let incidentDescription = `The patient was performing an exercise session using the AI-powered exercise monitoring system. During the session, the patient's body was not detected in the camera frame for a continuous period, and the system was unable to confirm the patient's presence.`;
          let alertType = `Patient Not Detected`;
          let detectionStatus = `Patient Not Visible in Camera Frame`;

          if (type === 'fall_detected') {
            incidentSubject = `Potential Fall Detected`;
            incidentDescription = `The patient was performing an exercise session using the AI-powered exercise monitoring system. During the session, the system detected a potential fall event. This is a critical safety alert requiring immediate verification of the patient's well-being.`;
            alertType = `Fall Detected`;
            detectionStatus = `Potential Fall Detected in Camera Frame`;
          }

          const emailHtml = `
            <div style="font-family: monospace; white-space: pre-wrap; font-size: 14px; color: #1a202c; line-height: 1.6; max-width: 600px; padding: 25px; border: 2px solid #de350b; background-color: #fdf2f2; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
Dear ${recipient.name},

This is an automated emergency alert from DiaFit AI. You are receiving this message as the patient's ${recipient.role}.

${incidentDescription}

Please check on the patient immediately and ensure that they are safe.

━━━━━━━━━━━━━━━━━━━━
PATIENT DETAILS
━━━━━━━━━━━━━━━━━━━━

Patient Name: ${user.firstName} ${user.lastName}
Patient ID: ${user._id}
Age: ${age}
Gender: ${user.profile?.gender || 'N/A'}
Exercise: ${exerciseName}
Session Start Time: ${startTime}
Alert Time: ${alertTime}
Last Known Location: ${addressString}
${mapsLink}

━━━━━━━━━━━━━━━━━━━━
GUARDIAN / EMERGENCY CONTACT
━━━━━━━━━━━━━━━━━━━━

Guardian Name: ${contact?.name || 'Emergency Contact'}
Relationship: ${contact?.relationship || 'Guardian'}
Phone Number: ${contact?.phone || 'N/A'}
Email: ${contact?.email || 'N/A'}

Secondary Guardian Name: ${user.profile?.guardian?.name || 'Not Configured'}
Secondary Guardian Phone: ${user.profile?.guardian?.phone || 'Not Configured'}

━━━━━━━━━━━━━━━━━━━━
ALERT INFORMATION
━━━━━━━━━━━━━━━━━━━━

Alert Type: ${alertType}
Detection Status: ${detectionStatus}
Detection Duration: ${duration}
Current Status: Immediate Attention Recommended

Please contact the patient or visit them as soon as possible to verify their safety.

This alert was automatically generated by the DiaFit AI Patient Monitoring System.

Regards,
DiaFit AI
AI-Powered Diabetes Care & Monitoring System

⚠️ This is an automated safety alert. Please do not reply to this email.
            </div>
          `;
          
          console.log(`[Emergency Alert] Dispatching alert email to ${recipient.email} (Role: ${recipient.role})`);
          await sendEmail({
            to: recipient.email,
            subject: `🚨 CRITICAL EMERGENCY ALERT: ${user.firstName} ${user.lastName} (${incidentSubject})`,
            html: emailHtml
          });
        } catch (emailErr) {
          console.error(`Failed to send emergency contact email to ${recipient.email}:`, emailErr);
        }
      }
    }

    // Emit real-time alert via socket.io
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user._id}`).emit('alert', alert);
      // Notify doctor if assigned
      const User = require('../models/User');
      const user = await User.findById(req.user._id);
      if (user.patientInfo?.doctorId) {
        io.to(`user_${user.patientInfo.doctorId}`).emit('patient_alert', alert);
      }
    }

    res.status(201).json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get alerts
router.get('/', protect, async (req, res) => {
  try {
    const { acknowledged, severity, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user._id };
    if (acknowledged !== undefined) filter.acknowledged = acknowledged === 'true';
    if (severity) filter.severity = severity;

    const alerts = await Alert.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    const total = await Alert.countDocuments(filter);
    res.json({ success: true, data: alerts, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Acknowledge alert
router.put('/:id/acknowledge', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true, acknowledgedBy: req.user._id, acknowledgedAt: new Date() },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resolve alert
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, { resolved: true, resolvedAt: new Date() }, { new: true });
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });
    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
