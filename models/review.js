const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
    reviewer_name: String,
    comment: String,
    rating: Number,
    created_at: String,
});

const restaurantSchema = new mongoose.Schema({
    restaurant_name: String,
    branch_code: String,
    overall_rating: Number,
    total_rating: String,
    five_star_percentage: Number,
    four_star_percentage: Number,
    three_star_percentage: Number,
    two_star_percentage: Number,
    one_star_percentage: Number,
    reviews: [reviewSchema]
});

module.exports = mongoose.model('Restaurants', restaurantSchema)