// src/routes/verification.routes.js
const express = require('express');
const { startVerification, getVerificationLogs } = require('../controllers/verification.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/:id/start', startVerification);
router.get('/:id/logs', getVerificationLogs);

module.exports = router;
