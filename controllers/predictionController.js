const { admin,db, storage } = require('../database/firestore');
const { v4: uuidv4 } = require('uuid');

exports.predict = async (req, res) => {
  try {
    const { email, result } = req.body;
    const file = req.file;

    // Memastikan email, file, dan result ada dalam request
    if (!email || !file || !result) {
      return res.status(400).json({ message: 'Email, image, and result are required' });
    }

    const filename = `${email}/${uuidv4()}_${file.originalname}`;

    // Upload file to Google Cloud Storage
    const bucket = storage.bucket('wearshare-bucket'); // Menggunakan Firebase Storage bucket
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype
      }
    });

    blobStream.on('error', (err) => {
      console.error(err);
      res.status(500).json({ message: 'Failed to upload image' });
    });

    blobStream.on('finish', async () => {
      // Get public URL of the uploaded image
      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

      try {
        // Save prediction history to Firestore
        await db.collection('predictionHistory').add({
          email: email,
          imageUrl: publicUrl,
          result: result,
          timestamp: admin.firestore.FieldValue.serverTimestamp() // Import admin jika belum diimport sebelumnya
        });
        
        res.status(200).json({ message: 'Prediction saved successfully' });
      } catch (error) {
        console.error('Error saving prediction to Firestore:', error);
        res.status(500).json({ message: 'Failed to save prediction to Firestore' });
      }
    });

    blobStream.end(file.buffer);
  } catch (error) {
    console.error('Error in prediction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// New function to get prediction history by email
exports.getHistoryByEmail = async (req, res) => {
  try {
    const email = req.params.email;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const historySnapshot = await db.collection('predictionHistory').where('email', '==', email).get();

    if (historySnapshot.empty) {
      return res.status(404).json({ message: 'No prediction history found for this email' });
    }

    const history = historySnapshot.docs.map(doc => doc.data());

    res.status(200).json({ history });
  } catch (error) {
    console.error('Error retrieving prediction history:', error);
    res.status(500).json({ message: 'Failed to retrieve prediction history' });
  }
};
