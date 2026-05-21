// src/models/Candidate.js
// Mongoose schema for candidates undergoing background verification

const mongoose = require('mongoose');

const VERIFICATION_STATUS = ['PENDING', 'VERIFIED', 'FAILED', 'PARTIAL'];

const CandidateSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
    },
    aadhaarNumber: {
      type: String,
      required: [true, 'Aadhaar number is required'],
      match: [/^\d{12}$/, 'Aadhaar must be exactly 12 digits'],
    },
    panNumber: {
      type: String,
      required: [true, 'PAN number is required'],
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. ABCDE1234F)'],
    },
    dob: {
      type: Date,
      required: [true, 'Date of birth is required'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [500, 'Address cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: VERIFICATION_STATUS,
      default: 'PENDING',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for faster querying
CandidateSchema.index({ createdBy: 1, status: 1 });
CandidateSchema.index({ fullName: 'text', email: 'text' });

// Virtual: masked Aadhaar for safe display
CandidateSchema.virtual('maskedAadhaar').get(function () {
  if (!this.aadhaarNumber) return null;
  return `XXXX-XXXX-${this.aadhaarNumber.slice(-4)}`;
});

// Virtual: verification logs
CandidateSchema.virtual('verificationLogs', {
  ref: 'VerificationLog',
  localField: '_id',
  foreignField: 'candidateId',
});

module.exports = mongoose.model('Candidate', CandidateSchema);
