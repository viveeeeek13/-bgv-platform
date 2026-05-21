// src/routes/report.routes.js
const express = require('express');
const { downloadReport } = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/:id', downloadReport);

module.exports = router;
