const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/stats.controller');

router.get('/:sport/search', StatsController.searchPlayers.bind(StatsController));
router.get('/:sport/:statType', StatsController.getStats.bind(StatsController));

module.exports = router;