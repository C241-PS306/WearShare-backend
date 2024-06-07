// routes/nearbyRoutes.js

const express = require('express');
const router = express.Router();
const { findNearbyOrphanages } = require('../controllers/nearbyController');

// Endpoint untuk mencari panti asuhan terdekat
router.get('/nearby', findNearbyOrphanages);

module.exports = router;
