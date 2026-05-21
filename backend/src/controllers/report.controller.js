// src/controllers/report.controller.js
// Generates and streams PDF verification reports

const Candidate = require('../models/Candidate');
const VerificationLog = require('../models/VerificationLog');
const { generateReportPDF } = require('../services/report.service');

/**
 * GET /api/reports/:id
 * Generate and download PDF report for a candidate
 */
const downloadReport = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    if (candidate.status === 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Verification not yet completed. Please run verification first.',
      });
    }

    const logs = await VerificationLog.find({ candidateId: candidate._id }).sort({ verifiedAt: 1 });

    const pdfBuffer = await generateReportPDF(candidate, logs, req.user.name);

    // Set response headers for PDF download
    const filename = `BGV_Report_${candidate.fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

module.exports = { downloadReport };
