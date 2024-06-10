const express = require('express');
const router = express.Router();
const { getAllPantiAsuhan, getPantiAsuhanById } = require('../controllers/listController');
const { getAllPengolahanLimbah, getpengolahanLimbahById } = require('../controllers/listController');


// Endpoint untuk mendapatkan semua data panti asuhan
router.get('/panti-asuhan', getAllPantiAsuhan);
// Endpoint untuk mendapatkan detail panti asuhan berdasarkan ID
router.get('/panti-asuhan/:id', getPantiAsuhanById);

// Endpoint untuk mendapatkan semua data pengolahan limbah
router.get('/pengolahan-limbah', getAllPengolahanLimbah);
// Endpoint untuk mendapatkan detail pengolahan limbah berdasarkan ID
router.get('/pengolahan-limbah/:id', getpengolahanLimbahById );




module.exports = router; // Export router agar dapat digunakan oleh aplikasi Express
