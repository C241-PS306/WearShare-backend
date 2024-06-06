const express = require('express');
const router = express.Router();
const controller = require('./controller');

// Endpoint untuk mendapatkan semua data panti asuhan
router.get('/panti-asuhan', controller.getAllPantiAsuhan);

// Endpoint untuk mendapatkan detail panti asuhan berdasarkan ID
router.get('/panti-asuhan/:id', controller.getPantiAsuhanById);

module.exports = router; // Export router agar dapat digunakan oleh aplikasi Express
