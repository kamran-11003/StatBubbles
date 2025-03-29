const express = require('express');
const router = express.Router();
const LiveScoresController = require('../controllers/live-scores.controller');

router.get('/', LiveScoresController.getLiveScores.bind(LiveScoresController));

module.exports = router;