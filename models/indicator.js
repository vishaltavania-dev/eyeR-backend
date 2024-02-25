const mongoose = require('mongoose');
const indicatorSchema = new mongoose.Schema({
    positive: [String],
    negative: [String],
    neutral: [String],
    positiveSummary: String,
    negativeSummary: String,
    neutralSummary: String,
    restaurant: { type: mongoose.SchemaTypes.ObjectId, ref: 'Restaurants' }
}, { timestamps: true });

module.exports = mongoose.model('Indicators', indicatorSchema)