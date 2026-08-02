const express = require('express');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');
const Report = require('../models/Report');
const HealthRecord = require('../models/HealthRecord');
const ExerciseSession = require('../models/ExerciseSession');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const router = express.Router();

// Generate report
router.post('/generate', protect, async (req, res) => {
  try {
    const { type, startDate, endDate, title } = req.body;
    const userId = req.body.userId || req.user._id;

    const report = await Report.create({
      userId,
      generatedBy: req.user._id,
      type,
      title: title || `${type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Report`,
      period: { startDate: new Date(startDate), endDate: new Date(endDate) },
      status: 'generating',
    });

    // Gather data based on type
    const periodFilter = { userId, recordedAt: { $gte: new Date(startDate), $lte: new Date(endDate) } };
    let data = {};

    if (type === 'health_summary' || type === 'comprehensive') {
      data.healthRecords = await HealthRecord.find(periodFilter).sort({ recordedAt: 1 });
    }
    if (type === 'exercise_report' || type === 'comprehensive') {
      data.exerciseSessions = await ExerciseSession.find({
        userId,
        startTime: { $gte: new Date(startDate), $lte: new Date(endDate) },
      })
        .populate('exerciseId', 'name category')
        .sort({ startTime: 1 });
    }
    if (type === 'blood_sugar_trends' || type === 'comprehensive') {
      data.bloodSugar = await HealthRecord.find({
        userId,
        metricType: { $in: ['fasting', 'postprandial', 'random'] },
        recordedAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      }).sort({ recordedAt: 1 });
    }

    report.data = data;

    // Generate PDF
    const uploadsDir = path.join(__dirname, '../../uploads/reports');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const fileName = `report_${report._id}.pdf`;
    const filePath = path.join(uploadsDir, fileName);

    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // PDF content
    doc.fontSize(24).text('DiaFit AI', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(report.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`);
    doc.text(`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`);
    doc.moveDown();

    if (data.healthRecords?.length) {
      doc.fontSize(16).text('Health Records');
      doc.moveDown(0.5);
      doc.fontSize(10);
      data.healthRecords.slice(0, 20).forEach((r) => {
        doc.text(`${new Date(r.recordedAt).toLocaleDateString()} - ${r.metricType}: ${r.value} ${r.unit}`);
      });
      doc.moveDown();
    }

    if (data.exerciseSessions?.length) {
      doc.fontSize(16).text('Exercise Sessions');
      doc.moveDown(0.5);
      doc.fontSize(10);
      data.exerciseSessions.slice(0, 20).forEach((s) => {
        doc.text(`${new Date(s.startTime).toLocaleDateString()} - ${s.exerciseId?.name || 'Exercise'} | ${s.repsCompleted} reps | ${s.accuracyScore}% accuracy`);
      });
      doc.moveDown();
    }

    if (data.bloodSugar?.length) {
      doc.fontSize(16).text('Blood Sugar Trends');
      doc.moveDown(0.5);
      doc.fontSize(10);
      const values = data.bloodSugar.map((r) => r.value);
      const avg = values.length ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1) : 'N/A';
      doc.text(`Average: ${avg} mg/dL | Readings: ${values.length}`);
      doc.text(`Min: ${Math.min(...values)} mg/dL | Max: ${Math.max(...values)} mg/dL`);
    }

    doc.end();

    writeStream.on('finish', async () => {
      report.filePath = `/uploads/reports/${fileName}`;
      report.fileSize = fs.statSync(filePath).size;
      report.status = 'completed';
      report.summary = `Report contains ${data.healthRecords?.length || 0} health records, ${data.exerciseSessions?.length || 0} exercise sessions.`;
      await report.save();
      res.json({ success: true, data: report });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get reports
router.get('/', protect, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = {};
    if (req.user.role === 'patient') filter.userId = req.user._id;
    if (type) filter.type = type;

    const reports = await Report.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Download report PDF
router.get('/:id/download', protect, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report || !report.filePath) return res.status(404).json({ success: false, message: 'Report not found' });

    const filePath = path.join(__dirname, '../../', report.filePath);
    if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File not found' });

    res.download(filePath, `DiaFit_Report_${report.type}.pdf`);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Share report
router.put('/:id/share', protect, async (req, res) => {
  try {
    const { userId } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    report.sharedWith.push({ userId, sharedAt: new Date() });
    await report.save();
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
