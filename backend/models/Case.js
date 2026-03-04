const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
    firNumber: { type: String, required: true },
    policeStation: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    caseFile: { type: String }, // Storing case file as base64 string or URL
    fileHandling: { type: String }, // Text field for file handling details
    petitionerName: { type: String },
    petitionerAddress: { type: String },
    petitionerContact: { type: String },
    evidenceLogs: [{
        date: { type: Date, required: true },
        mode: { type: String, required: true },
        remark: { type: String, required: true },
        referenceData: { type: String }, // New field for URL / Mobile Number / KYC
        criminalName: { type: String },
        criminalAddress: { type: String },
        criminalPhoto: { type: String }, // Base64 string or URL
        attachment: { type: String } // Base64 string or URL
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Case', CaseSchema);
