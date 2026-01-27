const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    memorial: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Memorial',
        required: true
    },
    visitDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    photos: [{
        url: String,
        caption: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    weather: {
        condition: String,
        temperature: Number
    },
    companions: [String],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Visit', VisitSchema);