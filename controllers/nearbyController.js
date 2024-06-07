// controllers/nearbyController.js

const db = require('../database/firestore').db;

const findNearbyOrphanages = async (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
        return res.status(400).json({ message: "Latitude and Longitude are required" });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
        return res.status(400).json({ message: "Invalid latitude or longitude" });
    }

    try {
        const snapshot = await db.collection('orphanage').get();
        const orphanages = [];

        console.log(`Fetched ${snapshot.size} orphanages from Firestore`);

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Document data:`, data); // Log each document's data

            if (data['lat, long']) {
                const [latStr, longStr] = data['lat, long'];
                const orphanageLat = parseFloat(latStr.replace(/[^0-9.-]/g, '')); // Remove non-numeric characters
                const orphanageLng = parseFloat(longStr.replace(/[^0-9.-]/g, '')); // Remove non-numeric characters
                
                if (!isNaN(orphanageLat) && !isNaN(orphanageLng)) {
                    const distance = calculateDistance(lat, lng, orphanageLat, orphanageLng);
                    orphanages.push({ id: doc.id, distance, ...data });
                } else {
                    console.error(`Invalid coordinates for orphanage ${doc.id}`);
                }
            } else {
                console.error(`Missing coordinates for orphanage ${doc.id}`);
            }
        });

        console.log(`Found ${orphanages.length} orphanages with valid coordinates`);

        orphanages.sort((a, b) => a.distance - b.distance);

        res.json(orphanages);
    } catch (error) {
        console.error("Error fetching nearby orphanages:", error); // Log the specific error
        res.status(500).json({ message: "Error fetching nearby orphanages", error: error.message });
    }
};

module.exports = { findNearbyOrphanages };