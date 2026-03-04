const mongoose = require('mongoose');

const cdrSchema = new mongoose.Schema({
    mobile: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid 10-digit mobile number!`
        }
    },
    // Adding optional fields for future flexibility
    callerId: String,
    callType: String,
    duration: Number,
    timestamp: Date,
    location: String,

    // File upload fields (similar to IPDR)
    fileName: { type: String }, // Original file name
    filePath: { type: String }, // Path to the downloaded file
    uploadDate: { type: Date, default: Date.now },
    status: { type: String, default: 'Pending' },
    data: { type: Array, default: [] }
}, { timestamps: true });

module.exports = mongoose.model('CDR', cdrSchema);
