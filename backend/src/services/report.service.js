// src/services/report.service.js
// Generates professional PDF verification reports using Puppeteer

const puppeteer = require('puppeteer');

/**
 * Build HTML template for the verification report
 * @param {Object} candidate - Candidate document
 * @param {Object} logs - Aadhaar and PAN logs
 * @param {string} verifiedByName - Name of the user who ran verification
 * @returns {string} HTML string
 */
const buildReportHTML = (candidate, logs, verifiedByName) => {
  const aadhaarLog = logs.find((l) => l.verificationType === 'AADHAAR');
  const panLog = logs.find((l) => l.verificationType === 'PAN');
  const generatedOn = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const statusColor = {
    VERIFIED: '#16a34a',
    FAILED: '#dc2626',
    PARTIAL: '#d97706',
    PENDING: '#6b7280',
  };

  const badgeStyle = (status) =>
    `background:${statusColor[status?.toUpperCase()] || '#6b7280'};color:#fff;padding:4px 12px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:0.5px;`;

  const checkIcon = (passed) =>
    passed
      ? `<span style="color:#16a34a;font-size:18px;">✓</span>`
      : `<span style="color:#dc2626;font-size:18px;">✗</span>`;

  const maskedAadhaar = candidate.aadhaarNumber
    ? `XXXX-XXXX-${candidate.aadhaarNumber.slice(-4)}`
    : 'N/A';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>BGV Report - ${candidate.fullName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; font-size: 14px; }
    .page { padding: 40px 48px; max-width: 794px; margin: 0 auto; }
    .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 24px; border-bottom: 3px solid #1e40af; margin-bottom: 28px; }
    .header-left { }
    .logo-text { font-size: 22px; font-weight: 800; color: #1e40af; letter-spacing: -0.5px; }
    .logo-sub { font-size: 11px; color: #64748b; letter-spacing: 2px; text-transform: uppercase; margin-top: 2px; }
    .report-id { text-align: right; font-size: 11px; color: #64748b; }
    .report-id strong { display: block; color: #1e293b; font-size: 13px; }
    .title-section { text-align: center; margin-bottom: 28px; }
    .title-section h1 { font-size: 20px; font-weight: 700; letter-spacing: 1px; color: #1e293b; text-transform: uppercase; }
    .title-section p { font-size: 11px; color: #94a3b8; letter-spacing: 1.5px; margin-top: 4px; text-transform: uppercase; }
    .overall-status { display: flex; align-items: center; justify-content: center; gap: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px 24px; margin-bottom: 28px; }
    .overall-status .label { font-size: 13px; color: #64748b; font-weight: 500; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 14px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 24px; }
    .info-item label { font-size: 11px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.8px; display: block; margin-bottom: 2px; }
    .info-item span { font-size: 14px; color: #1e293b; font-weight: 500; }
    .info-item.full-width { grid-column: 1 / -1; }
    .verification-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 12px; }
    .vc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .vc-title { font-size: 14px; font-weight: 600; color: #1e293b; }
    .vc-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .vc-check { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; }
    .vc-ref { font-size: 10px; color: #94a3b8; margin-top: 10px; border-top: 1px solid #f1f5f9; padding-top: 8px; }
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .signature-box { text-align: center; }
    .sig-line { width: 160px; border-top: 1.5px solid #1e293b; margin: 0 auto 6px; }
    .sig-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.8px; }
    .sig-name { font-size: 12px; font-weight: 600; color: #1e293b; margin-bottom: 2px; }
    .disclaimer { font-size: 9px; color: #94a3b8; max-width: 320px; line-height: 1.5; }
    .watermark { position: fixed; bottom: 60px; right: 40px; opacity: 0.04; font-size: 72px; font-weight: 900; color: #1e40af; transform: rotate(-30deg); pointer-events: none; letter-spacing: -4px; }
  </style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="header-left">
      <div class="logo-text">🛡 BGV Platform</div>
      <div class="logo-sub">Background Verification System</div>
    </div>
    <div class="report-id">
      <strong>VERIFICATION REPORT</strong>
      Report ID: BGV-${Date.now().toString(36).toUpperCase()}<br/>
      Generated: ${generatedOn}
    </div>
  </div>

  <div class="title-section">
    <h1>Background Verification Report</h1>
    <p>Confidential &bull; Official Use Only</p>
  </div>

  <div class="overall-status">
    <span class="label">Overall Verification Status:</span>
    <span style="${badgeStyle(candidate.status)}">${candidate.status}</span>
  </div>

  <div class="section">
    <div class="section-title">Candidate Information</div>
    <div class="info-grid">
      <div class="info-item">
        <label>Full Name</label>
        <span>${candidate.fullName}</span>
      </div>
      <div class="info-item">
        <label>Email Address</label>
        <span>${candidate.email}</span>
      </div>
      <div class="info-item">
        <label>Mobile Number</label>
        <span>${candidate.phone}</span>
      </div>
      <div class="info-item">
        <label>Date of Birth</label>
        <span>${new Date(candidate.dob).toLocaleDateString('en-IN')}</span>
      </div>
      <div class="info-item">
        <label>Aadhaar Number</label>
        <span>${maskedAadhaar}</span>
      </div>
      <div class="info-item">
        <label>PAN Number</label>
        <span>${candidate.panNumber}</span>
      </div>
      <div class="info-item full-width">
        <label>Address</label>
        <span>${candidate.address}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Verification Results</div>

    ${aadhaarLog ? `
    <div class="verification-card">
      <div class="vc-header">
        <span class="vc-title">🪪 Aadhaar Verification</span>
        <span style="${badgeStyle(aadhaarLog.verificationStatus === 'verified' ? 'VERIFIED' : 'FAILED')}">
          ${aadhaarLog.verificationStatus.toUpperCase()}
        </span>
      </div>
      <div class="vc-checks">
        <div class="vc-check">${checkIcon(aadhaarLog.responsePayload?.nameMatch)} Name Match</div>
        <div class="vc-check">${checkIcon(aadhaarLog.responsePayload?.dobMatch)} DOB Match</div>
        <div class="vc-check">${checkIcon(aadhaarLog.verificationStatus === 'verified')} Record Found</div>
        <div class="vc-check">${checkIcon(aadhaarLog.verificationStatus === 'verified')} Format Valid</div>
      </div>
      <div class="vc-ref">
        Verified At: ${new Date(aadhaarLog.verifiedAt).toLocaleString('en-IN')} &bull;
        Ref: ${aadhaarLog.responsePayload?.referenceId || 'N/A'} &bull;
        Message: ${aadhaarLog.responsePayload?.message || 'N/A'}
      </div>
    </div>` : ''}

    ${panLog ? `
    <div class="verification-card">
      <div class="vc-header">
        <span class="vc-title">📋 PAN Verification</span>
        <span style="${badgeStyle(panLog.verificationStatus === 'verified' ? 'VERIFIED' : 'FAILED')}">
          ${panLog.verificationStatus.toUpperCase()}
        </span>
      </div>
      <div class="vc-checks">
        <div class="vc-check">${checkIcon(panLog.responsePayload?.panStatus === 'active')} PAN Active</div>
        <div class="vc-check">${checkIcon(panLog.verificationStatus === 'verified')} Record Found</div>
        <div class="vc-check">${checkIcon(panLog.verificationStatus === 'verified')} Format Valid</div>
        <div class="vc-check">${checkIcon(panLog.responsePayload?.panStatus === 'active')} No Deactivation</div>
      </div>
      <div class="vc-ref">
        Verified At: ${new Date(panLog.verifiedAt).toLocaleString('en-IN')} &bull;
        Ref: ${panLog.responsePayload?.referenceId || 'N/A'} &bull;
        Message: ${panLog.responsePayload?.message || 'N/A'}
      </div>
    </div>` : ''}
  </div>

  <div class="footer">
    <div class="disclaimer">
      This report is generated automatically by the BGV Platform and is confidential.
      It is intended solely for authorized personnel. Unauthorized disclosure is prohibited.
      Results are based on mock verification APIs for demonstration purposes.
    </div>
    <div class="signature-box">
      <div class="sig-name">${verifiedByName}</div>
      <div class="sig-line"></div>
      <div class="sig-label">Authorized Signatory</div>
    </div>
  </div>

  <div class="watermark">VERIFIED</div>
</div>
</body>
</html>`;
};

/**
 * Generate a PDF buffer from candidate verification data
 * @param {Object} candidate - Mongoose candidate document
 * @param {Array} logs - Verification log documents
 * @param {string} verifiedByName - Verifier's name
 * @returns {Buffer} PDF binary buffer
 */
const generateReportPDF = async (candidate, logs, verifiedByName) => {
  const html = buildReportHTML(candidate, logs, verifiedByName);

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      printBackground: true,
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
};

module.exports = { generateReportPDF, buildReportHTML };
