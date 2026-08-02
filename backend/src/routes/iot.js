const express = require('express');
const { protect } = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const router = express.Router();

// Ingest data from IoT device
router.post('/data', protect, async (req, res) => {
  try {
    const { deviceId, metricType, value, valueSecondary, unit, timestamp } = req.body;

    // Verify device belongs to user
    const user = await User.findById(req.user._id);
    const device = user.iotDevices.find((d) => d.deviceId === deviceId);
    if (!device) {
      return res.status(400).json({ success: false, message: 'Device not registered' });
    }

    // Map device type to source
    const sourceMap = { glucose_monitor: 'iot_glucose', smartwatch: 'iot_smartwatch', blood_pressure: 'iot_bp' };
    const source = sourceMap[device.deviceType] || 'import';

    const record = await HealthRecord.create({
      userId: req.user._id,
      metricType,
      value,
      valueSecondary,
      unit: unit || getDefaultUnit(metricType),
      recordedAt: timestamp || new Date(),
      source,
      deviceId,
    });

    // Update device last sync
    device.lastSync = new Date();
    await user.save();

    // Emit real-time data
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.user._id}`).emit('iot_data', record);
    }

    // Auto-alert for critical values
    if (isCriticalValue(metricType, value)) {
      const Alert = require('../models/Alert');
      const alertType = value < 70 ? 'low_blood_sugar' : 'high_blood_sugar';
      await Alert.create({
        userId: req.user._id,
        type: alertType,
        severity: 'high',
        title: `${alertType === 'low_blood_sugar' ? 'Low' : 'High'} Blood Sugar Alert`,
        message: `Your ${metricType} blood sugar is ${value} ${unit || 'mg/dL'}`,
        data: { value, metricType, deviceId },
      });
    }

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Register IoT device
router.post('/register', protect, async (req, res) => {
  try {
    const { deviceId, deviceType, deviceName } = req.body;
    const user = await User.findById(req.user._id);

    const existing = user.iotDevices.find((d) => d.deviceId === deviceId);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Device already registered' });
    }

    user.iotDevices.push({ deviceId, deviceType, deviceName, isActive: true });
    await user.save();

    res.status(201).json({ success: true, data: user.iotDevices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's IoT devices
router.get('/devices', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: user.iotDevices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Webhook for external IoT devices
router.post('/webhook', async (req, res) => {
  try {
    const { secret, deviceId, userId, metricType, value, valueSecondary, unit } = req.body;

    if (secret !== process.env.IOT_WEBHOOK_SECRET) {
      return res.status(401).json({ success: false, message: 'Invalid webhook secret' });
    }

    const record = await HealthRecord.create({
      userId,
      metricType,
      value,
      valueSecondary,
      unit: unit || getDefaultUnit(metricType),
      source: 'iot_glucose',
      deviceId,
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

function getDefaultUnit(metricType) {
  const units = { fasting: 'mg/dL', postprandial: 'mg/dL', random: 'mg/dL', hba1c: '%', heart_rate: 'bpm', blood_pressure: 'mmHg', weight: 'kg', spo2: '%' };
  return units[metricType] || '';
}

function isCriticalValue(metricType, value) {
  if (['fasting', 'postprandial', 'random'].includes(metricType)) {
    return value < 54 || value > 300;
  }
  return false;
}

module.exports = router;
