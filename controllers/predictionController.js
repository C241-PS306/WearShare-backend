const { admin,db, storage } = require('../database/firestore');
const { v4: uuidv4 } = require('uuid');
const tf = require('@tensorflow/tfjs-node');
require('dotenv').config();

// Load the model from Google Cloud Storage
let model;
const loadModel = async () => {
  if (!model) {
    const modelUrl = process.env.MODEL_URL;
    if (!modelUrl) {
      throw new Error('Model URL not defined in environment variables');
    }
    model = await tf.loadLayersModel(modelUrl);
  }
};

// Function to map prediction result to class labels based on threshold
const getResultClass = (prediction) => {
  const threshold = 0.57; // You can adjust this threshold as needed
  
  if (prediction[0] >= threshold) { // Assuming prediction is a single value in an array
    return 'Baju tidak layak';
  } else {
    return 'Baju layak';
  }
};


exports.predict = async (req, res) => {
  try {
    const { email } = req.body;
    const file = req.file;

    // Memastikan email, file, dan result ada dalam request
    if (!email || !file ) {
      return res.status(400).json({ message: 'Email and image are required' });
    }

    await loadModel(); // Ensure the model is loaded

    // Preprocess the image file
    const imageBuffer = file.buffer;
    const tensor = tf.node.decodeImage(imageBuffer);
    const resizedImage = tf.image.resizeBilinear(tensor, [256, 256]); // Resize to match your model's input size
    const normalizedImage = resizedImage.div(255.0).expandDims(0); // Normalize and add batch dimension

    // Make prediction
    const prediction = model.predict(normalizedImage);
    const resultArray = prediction.arraySync()[0]; // Assuming single output
    console.log('Prediction values:', resultArray); // Log the prediction values
    const resultClass = getResultClass(resultArray);
    console.log('Result class:', resultClass); // Log the predicted class

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
          result: resultClass,
          timestamp: admin.firestore.FieldValue.serverTimestamp() // Import admin jika belum diimport sebelumnya
        });
        
        res.status(201).json({ message: `Prediction saved successfully: ${resultClass}`, result: resultClass, imageUrl: publicUrl });
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
