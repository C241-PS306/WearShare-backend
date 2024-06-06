const express = require('express');
const router = express.Router();
const { getAllPantiAsuhan, getPantiAsuhanById } = require('../controllers/listController');

// Endpoint untuk mendapatkan semua data panti asuhan
router.get('/panti-asuhan', getAllPantiAsuhan);

// Endpoint untuk mendapatkan detail panti asuhan berdasarkan ID
router.get('/panti-asuhan/:id', getPantiAsuhanById);

module.exports = router; // Export router agar dapat digunakan oleh aplikasi Express
