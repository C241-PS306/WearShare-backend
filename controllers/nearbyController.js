// controllers/nearbyController.js

const db = require('../database/firestore').db;

// Fungsi untuk menghitung jarak antara dua koordinat geografis menggunakan Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};

// Fungsi untuk mencari panti asuhan terdekat
const findNearbyOrphanages = async (req, res) => {
    const { latitude, longitude } = req.query; // Mengambil koordinat dari query parameter

    if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and Longitude are required" });
    }

    try {
        const snapshot = await db.collection('orphanage').get();
        const orphanages = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            const { latitude: lat, longitude: lng } = data.lot; // Mengambil latitude dan longitude dari geopoints
            const distance = calculateDistance(latitude, longitude, lat, lng);
            orphanages.push({ id: doc.id, distance, ...data });
        });

        // Mengurutkan panti asuhan berdasarkan jarak
        orphanages.sort((a, b) => a.distance - b.distance);

        // Mengirimkan data panti asuhan terdekat sebagai respons
        res.json(orphanages);
    } catch (error) {
        console.error("Error fetching nearby orphanages:", error);
        res.status(500).json({ message: "Error fetching nearby orphanages" });
    }
};
module.exports = {
    findNearbyOrphanages
};
