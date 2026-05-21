// src/routes/candidate.routes.js
const express = require('express');
const {
  getCandidates,
  createCandidate,
  getCandidateById,
  updateCandidate,
  deleteCandidate,
  getStats,
} = require('../controllers/candidate.controller');
const { candidateValidation } = require('../validations/candidate.validation');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All candidate routes require authentication
router.use(authenticate);

router.get('/stats', getStats);
router.get('/', getCandidates);
router.post('/', candidateValidation, validate, createCandidate);
router.get('/:id', getCandidateById);
router.put('/:id', candidateValidation, validate, updateCandidate);
router.delete('/:id', deleteCandidate);

module.exports = router;
