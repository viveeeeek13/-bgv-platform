// src/models/VerificationLog.js
// Stores every verification attempt for audit and reporting

const mongoose = require('mongoose');

const VerificationLogSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true,
    },
    verificationType: {
      type: String,
      enum: ['AADHAAR', 'PAN'],
      required: true,
    },
    requestPayload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    responsePayload: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    verificationStatus: {
      type: String,
      enum: ['verified', 'failed', 'error'],
      required: true,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false, // verifiedAt serves as timestamp
  }
);

// Index for fast lookup by candidate
VerificationLogSchema.index({ candidateId: 1, verificationType: 1 });

module.exports = mongoose.model('VerificationLog', VerificationLogSchema);
