// routes/nearbyRoutes.js

const express = require('express');
const router = express.Router();
const { findNearbyOrphanages } = require('../controllers/nearbyController');

router.get('/nearby', findNearbyOrphanages);

module.exports = router;