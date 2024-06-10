const db = require('../database/firestore').db;

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
};

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

    const MAX_DISTANCE = 50; // Maximum distance in km to be considered "nearby"

    try {
        const snapshot = await db.collection('orphanage').get();
        const orphanages = [];

        console.log(`Fetched ${snapshot.size} orphanages from Firestore`);

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`Document data:`, data); // Log each document's data

            if (data.location && data.location._latitude !== undefined && data.location._longitude !== undefined) {
                const orphanageLat = data.location._latitude;
                const orphanageLng = data.location._longitude;

                console.log(`Orphanage coordinates: (${orphanageLat}, ${orphanageLng})`);

                const distance = calculateDistance(lat, lng, orphanageLat, orphanageLng);

                if (distance <= MAX_DISTANCE) {
                    orphanages.push({ id: doc.id, distance, ...data });
                }
            } else {
                console.error(`Missing or invalid coordinates for orphanage ${doc.id}`);
            }
        });

        console.log(`Found ${orphanages.length} nearby orphanages within ${MAX_DISTANCE} km`);

        orphanages.sort((a, b) => a.distance - b.distance);

        res.json(orphanages);
    } catch (error) {
        console.error("Error fetching nearby orphanages:", error); // Log the specific error
        res.status(500).json({ message: "Error fetching nearby orphanages", error: error.message });
    }
};

module.exports = { findNearbyOrphanages };
