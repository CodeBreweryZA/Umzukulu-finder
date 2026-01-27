const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ['maintenance', 'flowers', 'cleaning', 'visit'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    scheduleDate: {
        type: Date,
        required: true
    },
    frequency: {
        type: String,
        enum: ['once', 'weekly', 'monthly', 'quarterly', 'yearly'],
        default: 'once'
    },
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
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
    nextServiceDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate next service date based on frequency
ServiceSchema.pre('save', function(next) {
    if (this.frequency !== 'once' && this.scheduleDate) {
        const nextDate = new Date(this.scheduleDate);
        
        switch(this.frequency) {
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
            case 'quarterly':
                nextDate.setMonth(nextDate.getMonth() + 3);
                break;
            case 'yearly':
                nextDate.setFullYear(nextDate.getFullYear() + 1);
                break;
        }
        
        this.nextServiceDate = nextDate;
    }
    next();
});

module.exports = mongoose.model('Service', ServiceSchema);