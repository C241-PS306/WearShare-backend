const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const serviceAccount=require('../service-account.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'wearshare-bucket' // Ganti dengan nama bucket Anda
});

const db = admin.firestore();
const storage = new Storage();

module.exports = { admin, db, storage };

