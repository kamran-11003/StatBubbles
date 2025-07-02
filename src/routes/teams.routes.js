const express = require('express');
const router = express.Router();
const TeamsController = require('../controllers/teams.controller');

router.get('/:league', TeamsController.getAllTeams.bind(TeamsController));
router.get('/:league/search', TeamsController.searchTeams.bind(TeamsController));

module.exports = router; 