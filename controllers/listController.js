const { Firestore } = require('@google-cloud/firestore'); //Import Firestore
const firestore = new Firestore(); //Firestore instance disini

// Get orphanage data from firestore
const getAllPantiAsuhan = async (req, res) => {
    try {
        // Get collection (snapshot) orphanage
        const snapshot = await firestore.collection('panti asuhan').get();
        const pantiAsuhan = []; // Empty list to storing orphanage data

        // Buat loop untuk menelusuri dokumen
        snapshot.forEach(doc => {
            // Menambahkan data panti asuhan ke dalam array dengan format yang sesuai
            pantiAsuhan.push({
                id: doc.id, // ID dokumen
                ...doc.data() // Data dokumen
            });
        });

        // Mengirimkan data panti asuhan sebagai respons
        res.json(pantiAsuhan);
    } catch (error) {
        // Menangani kesalahan jika terjadi saat mengambil data panti asuhan
        console.error("Error fetching panti asuhan:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil data panti asuhan" });
    }

};

// Fungsi untuk mendapatkan detail panti asuhan berdasarkan ID dari Firestore
const getPantiAsuhanById = async (req, res) => {
    const id = req.params.id; // Mengambil ID dari parameter URL
    try {
        // Mendapatkan dokumen panti asuhan berdasarkan ID dari koleksi 'pantiAsuhan'
        const doc = await firestore.collection('pantiAsuhan').doc(id).get();

        // Memeriksa apakah dokumen ditemukan
        if (!doc.exists) {
            res.status(404).json({ message: "Panti Asuhan tidak ditemukan" });
            return;
        }

        // Mengirimkan data panti asuhan dengan ID yang sesuai sebagai respons
        res.json({
            id: doc.id, // ID dokumen
            ...doc.data() // Data dokumen
        });
    } catch (error) {
        // Menangani kesalahan jika terjadi saat mengambil data panti asuhan
        console.error("Error fetching panti asuhan:", error);
        res.status(500).json({ message: "Terjadi kesalahan saat mengambil data panti asuhan" });
    }
};

// Export fungsi getAllPantiAsuhan dan getPantiAsuhanById agar dapat digunakan oleh routes.js
module.exports = {
    getAllPantiAsuhan,
    getPantiAsuhanById
};