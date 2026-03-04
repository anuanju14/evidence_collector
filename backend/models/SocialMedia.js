const mongoose = require('mongoose');

const socialMediaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    platform: {
        type: String,
        trim: true
    },
    handleOrLink: {
        type: String,
        trim: true
    }
}, { timestamps: true });

module.exports = mongoose.model('SocialMedia', socialMediaSchema);
