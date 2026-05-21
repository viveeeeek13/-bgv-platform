// src/controllers/candidate.controller.js
// CRUD operations for candidate management

const Candidate = require('../models/Candidate');
const VerificationLog = require('../models/VerificationLog');

/**
 * GET /api/candidates
 * List all candidates for the authenticated user with search, filter, pagination
 */
const getCandidates = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const query = { createdBy: req.user._id };

    // Text search on fullName or email
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    // Status filter
    if (status && ['PENDING', 'VERIFIED', 'FAILED', 'PARTIAL'].includes(status)) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [candidates, total] = await Promise.all([
      Candidate.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-aadhaarNumber'), // Never return raw Aadhaar in list
      Candidate.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        candidates,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/candidates
 * Create a new candidate
 */
const createCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.create({
      ...req.body,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Candidate created successfully.',
      data: { candidate },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/candidates/:id
 * Get a single candidate with verification logs
 */
const getCandidateById = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    }).populate('verificationLogs');

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    // Build safe response with masked Aadhaar
    const data = candidate.toObject({ virtuals: true });
    data.aadhaarNumber = candidate.maskedAadhaar;

    res.json({ success: true, data: { candidate: data } });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/candidates/:id
 * Update candidate details (only if status is PENDING)
 */
const updateCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOne({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    // Prevent editing after verification started
    if (candidate.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit candidate after verification has started.',
      });
    }

    // Disallow changing createdBy
    delete req.body.createdBy;
    delete req.body.status;

    const updated = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, message: 'Candidate updated.', data: { candidate: updated } });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/candidates/:id
 * Delete a candidate and all associated verification logs
 */
const deleteCandidate = async (req, res, next) => {
  try {
    const candidate = await Candidate.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    // Cascade delete verification logs
    await VerificationLog.deleteMany({ candidateId: req.params.id });

    res.json({ success: true, message: 'Candidate deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/candidates/stats
 * Dashboard statistics for the authenticated user
 */
const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [total, verified, failed, partial, pending] = await Promise.all([
      Candidate.countDocuments({ createdBy: userId }),
      Candidate.countDocuments({ createdBy: userId, status: 'VERIFIED' }),
      Candidate.countDocuments({ createdBy: userId, status: 'FAILED' }),
      Candidate.countDocuments({ createdBy: userId, status: 'PARTIAL' }),
      Candidate.countDocuments({ createdBy: userId, status: 'PENDING' }),
    ]);

    res.json({
      success: true,
      data: { stats: { total, verified, failed, partial, pending } },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCandidates,
  createCandidate,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getStats,
};
