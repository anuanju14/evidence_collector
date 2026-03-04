const mongoose = require('mongoose');

const ipdrSchema = new mongoose.Schema({
    ipAddress: { type: String, required: true },
    fileName: { type: String }, // Original file name
    filePath: { type: String }, // Path to the downloaded file
    uploadDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' },
    data: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('IPDR', ipdrSchema);
