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
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; color: #2c3e50; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); background-color: #ffffff; overflow: hidden;">
              <!-- Urgent Red Header Banner -->
              <div style="background-color: #d32f2f; color: #ffffff; padding: 25px 20px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">🚨 CRITICAL EMERGENCY ALERT</h1>
                <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.9;">DiaFit AI Patient Monitoring System</p>
              </div>

              <!-- Main Body Content -->
              <div style="padding: 25px;">
                <p style="margin-top: 0; font-size: 16px; font-weight: bold;">Dear ${recipient.name},</p>
                <p style="font-size: 15px; color: #333333; margin-bottom: 20px;">
                  This is an automated emergency alert from <strong>DiaFit AI</strong>. You are receiving this message because you are registered as the patient's <strong>${recipient.role}</strong>.
                </p>

                <!-- Incident Warning Box -->
                <div style="background-color: #ffebee; border-left: 5px solid #d32f2f; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
                  <p style="margin: 0 0 5px 0; color: #c62828; font-weight: bold; font-size: 15px;">Incident Report:</p>
                  <p style="margin: 0; color: #5d4037; font-size: 14px; line-height: 1.5;">${incidentDescription}</p>
                </div>

                <!-- Patient Details Card -->
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; margin-bottom: 12px; color: #495057; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #dee2e6; padding-bottom: 6px;">📋 Patient & Workout Details</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="padding: 6px 0; color: #6c757d; width: 40%;"><strong>Patient Name:</strong></td>
                      <td style="padding: 6px 0; color: #212529;"><strong>${user.firstName} ${user.lastName}</strong></td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6c757d;"><strong>Age / Gender:</strong></td>
                      <td style="padding: 6px 0; color: #212529;">${age} / ${user.profile?.gender || 'N/A'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6c757d;"><strong>Exercise:</strong></td>
                      <td style="padding: 6px 0; color: #212529;">${exerciseName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6c757d;"><strong>Session Started:</strong></td>
                      <td style="padding: 6px 0; color: #212529;">${startTime}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #6c757d;"><strong>Alert Dispatched:</strong></td>
                      <td style="padding: 6px 0; color: #d32f2f; font-weight: bold;">${alertTime}</td>
                    </tr>
                  </table>
                </div>

                <!-- Location Card & Map Link -->
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; margin-bottom: 12px; color: #495057; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #dee2e6; padding-bottom: 6px;">📍 Last Known Location</h3>
                  <p style="margin: 0 0 15px 0; font-size: 14px; color: #212529;"><strong>Address/Coordinates:</strong> ${addressString}</p>
                  ${location?.latitude && location?.longitude ? `
                  <div style="text-align: center; margin: 15px 0 5px 0;">
                    <a href="https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}" target="_blank" style="display: inline-block; background-color: #d32f2f; color: #ffffff; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 6px; box-shadow: 0 2px 5px rgba(211,47,47,0.3); font-size: 14px;">
                      Open Location in Google Maps 📍
                    </a>
                  </div>
                  ` : ''}
                </div>

                <!-- Emergency Contacts Card -->
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 18px; margin-bottom: 20px;">
                  <h3 style="margin-top: 0; margin-bottom: 12px; color: #495057; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #dee2e6; padding-bottom: 6px;">📞 Registered Emergency Contacts</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                    <tr>
                      <td style="padding: 5px 0; color: #6c757d; width: 40%;"><strong>Primary Contact:</strong></td>
                      <td style="padding: 5px 0; color: #212529;">${contact?.name || 'Emergency Contact'} (${contact?.relationship || 'Guardian'})</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #6c757d;"><strong>Phone Number:</strong></td>
                      <td style="padding: 5px 0; color: #212529;"><a href="tel:${contact?.phone || ''}" style="color: #0747a6; text-decoration: none; font-weight: bold;">${contact?.phone || 'N/A'}</a></td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #6c757d;"><strong>Secondary Guardian:</strong></td>
                      <td style="padding: 5px 0; color: #212529;">${user.profile?.guardian?.name || 'Not Configured'}</td>
                    </tr>
                    <tr>
                      <td style="padding: 5px 0; color: #6c757d;"><strong>Secondary Phone:</strong></td>
                      <td style="padding: 5px 0; color: #212529;">${user.profile?.guardian?.phone ? `<a href="tel:${user.profile.guardian.phone}" style="color: #0747a6; text-decoration: none;">${user.profile.guardian.phone}</a>` : 'Not Configured'}</td>
                    </tr>
                  </table>
                </div>

                <!-- System Diagnostics Card -->
                <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 8px; padding: 18px; margin-bottom: 25px;">
                  <h3 style="margin-top: 0; margin-bottom: 12px; color: #495057; font-size: 13px; text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid #dee2e6; padding-bottom: 6px;">⚙️ System Diagnostics</h3>
                  <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr>
                      <td style="padding: 4px 0; color: #6c757d; width: 40%;"><strong>Alert Type:</strong></td>
                      <td style="padding: 4px 0; color: #212529;">${alertType}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #6c757d;"><strong>Detection Status:</strong></td>
                      <td style="padding: 4px 0; color: #212529;">${detectionStatus}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #6c757d;"><strong>Duration Offline:</strong></td>
                      <td style="padding: 4px 0; color: #212529;">${duration}</td>
                    </tr>
                    <tr>
                      <td style="padding: 4px 0; color: #6c757d;"><strong>Current Status:</strong></td>
                      <td style="padding: 4px 0; color: #d32f2f; font-weight: bold;">Immediate Response Recommended</td>
                    </tr>
                  </table>
                </div>

                <p style="font-size: 15px; font-weight: bold; color: #d32f2f; margin-top: 25px; text-align: center; border-top: 1px solid #f1f3f5; padding-top: 20px;">
                  ⚠️ Action Required: Please verify the safety of the patient immediately!
                </p>

                <hr style="border: 0; border-top: 1px solid #e9ecef; margin: 25px 0 15px 0;"/>
                
                <p style="font-size: 12px; color: #868e96; text-align: center; margin: 0; line-height: 1.5;">
                  This alert was automatically generated by the DiaFit AI Patient Monitoring System.<br/>
                  ⚠️ This is a security notification. Please do not reply to this email.
                </p>
              </div>
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
