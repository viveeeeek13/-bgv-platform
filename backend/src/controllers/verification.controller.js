// src/controllers/verification.controller.js
// Orchestrates Aadhaar + PAN verification and stores results

const Candidate = require('../models/Candidate');
const VerificationLog = require('../models/VerificationLog');
const { verifyAadhaar, verifyPAN } = require('../services/verification.service');

/**
 * POST /api/verifications/:id/start
 * Trigger full verification for a candidate
 */
const startVerification = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    // Prevent re-verification of already verified candidates
    if (candidate.status === 'VERIFIED') {
      return res.status(400).json({
        success: false,
        message: 'Candidate is already fully verified.',
      });
    }

    // Update status to indicate verification is in progress
    candidate.status = 'PENDING';
    await candidate.save();

    // --- Aadhaar Verification ---
    const aadhaarRequest = {
      aadhaarNumber: candidate.aadhaarNumber,
      fullName: candidate.fullName,
      dob: candidate.dob,
    };

    let aadhaarResult;
    let aadhaarLogStatus;

    try {
      aadhaarResult = await verifyAadhaar(
        candidate.aadhaarNumber,
        candidate.fullName,
        candidate.dob
      );
      aadhaarLogStatus = aadhaarResult.status === 'verified' ? 'verified' : 'failed';
    } catch (err) {
      aadhaarResult = { status: 'error', message: 'Aadhaar API unreachable', error: err.message };
      aadhaarLogStatus = 'error';
    }

    // Store Aadhaar log (mask the number in request payload)
    await VerificationLog.create({
      candidateId: candidate._id,
      verificationType: 'AADHAAR',
      requestPayload: {
        ...aadhaarRequest,
        aadhaarNumber: `XXXX-XXXX-${candidate.aadhaarNumber.slice(-4)}`,
      },
      responsePayload: aadhaarResult,
      verificationStatus: aadhaarLogStatus,
    });

    // --- PAN Verification ---
    const panRequest = { panNumber: candidate.panNumber, fullName: candidate.fullName };

    let panResult;
    let panLogStatus;

    try {
      panResult = await verifyPAN(candidate.panNumber, candidate.fullName);
      panLogStatus = panResult.status === 'verified' ? 'verified' : 'failed';
    } catch (err) {
      panResult = { status: 'error', message: 'PAN API unreachable', error: err.message };
      panLogStatus = 'error';
    }

    // Store PAN log
    await VerificationLog.create({
      candidateId: candidate._id,
      verificationType: 'PAN',
      requestPayload: panRequest,
      responsePayload: panResult,
      verificationStatus: panLogStatus,
    });

    // --- Determine Overall Status ---
    const aadhaarPassed = aadhaarLogStatus === 'verified';
    const panPassed = panLogStatus === 'verified';

    let overallStatus;
    if (aadhaarPassed && panPassed) {
      overallStatus = 'VERIFIED';
    } else if (!aadhaarPassed && !panPassed) {
      overallStatus = 'FAILED';
    } else {
      overallStatus = 'PARTIAL'; // One passed, one failed
    }

    candidate.status = overallStatus;
    await candidate.save();

    res.json({
      success: true,
      message: `Verification complete. Status: ${overallStatus}`,
      data: {
        overallStatus,
        aadhaar: { status: aadhaarLogStatus, result: aadhaarResult },
        pan: { status: panLogStatus, result: panResult },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/verifications/:id/logs
 * Return all verification logs for a candidate
 */
const getVerificationLogs = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const logs = await VerificationLog.find({ candidateId: req.params.id }).sort({
      verifiedAt: -1,
    });

    res.json({ success: true, data: { logs } });
  } catch (error) {
    next(error);
  }
};

module.exports = { startVerification, getVerificationLogs };
