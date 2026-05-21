// src/services/verification.service.js
// Mock Aadhaar and PAN verification services
// Replace with real API calls (e.g. Sandbox APIs) in production

/**
 * Mock Aadhaar Verification
 * Simulates external API call with realistic delay
 * @param {string} aadhaarNumber - 12-digit Aadhaar
 * @param {string} fullName - Candidate name for name-match simulation
 * @param {Date} dob - Candidate DOB for dob-match simulation
 * @returns {Object} Mock verification result
 */
const verifyAadhaar = async (aadhaarNumber, fullName, dob) => {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Validate format (12 digits)
  const aadhaarRegex = /^\d{12}$/;
  if (!aadhaarRegex.test(aadhaarNumber)) {
    return {
      status: 'failed',
      nameMatch: false,
      dobMatch: false,
      message: 'Invalid Aadhaar format',
      errorCode: 'INVALID_FORMAT',
    };
  }

  // Simulate occasional failure (10% chance) for realism
  const shouldFail = Math.random() < 0.1;
  if (shouldFail) {
    return {
      status: 'failed',
      nameMatch: false,
      dobMatch: false,
      message: 'Aadhaar verification failed: Record not found',
      errorCode: 'RECORD_NOT_FOUND',
    };
  }

  return {
    status: 'verified',
    nameMatch: true,
    dobMatch: true,
    message: 'Aadhaar verified successfully',
    verifiedAt: new Date().toISOString(),
    referenceId: `AADHAAR-${Date.now()}`,
  };
};

/**
 * Mock PAN Verification
 * Simulates external API call
 * @param {string} panNumber - PAN in format ABCDE1234F
 * @param {string} fullName - Candidate name for validation
 * @returns {Object} Mock verification result
 */
const verifyPAN = async (panNumber, fullName) => {
  // Simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Validate PAN format
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(panNumber.toUpperCase())) {
    return {
      status: 'failed',
      panStatus: 'invalid',
      message: 'Invalid PAN format',
      errorCode: 'INVALID_FORMAT',
    };
  }

  // Simulate occasional failure (8% chance) for realism
  const shouldFail = Math.random() < 0.08;
  if (shouldFail) {
    return {
      status: 'failed',
      panStatus: 'inactive',
      message: 'PAN is inactive or deactivated',
      errorCode: 'PAN_INACTIVE',
    };
  }

  return {
    status: 'verified',
    panStatus: 'active',
    message: 'PAN verified successfully',
    verifiedAt: new Date().toISOString(),
    referenceId: `PAN-${Date.now()}`,
  };
};

module.exports = { verifyAadhaar, verifyPAN };
