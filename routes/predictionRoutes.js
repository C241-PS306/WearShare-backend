const express = require('express');
const multer = require('multer');
const { predict, getHistoryByEmail } = require('../controllers/predictionController');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/predict', upload.single('image'), predict);

// New route to get prediction history by email
router.get('/history/:email', getHistoryByEmail);

module.exports = router;
