const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    game: {
        type: String
    },
    user: {
        type: String
    },
    review: {
        type: String
    },
    rating: {
        type: Number,
        required: [true, 'Rating field is required'],
        min: [0, 'Rating must be a number between 0 and 10'],
        max: [10, 'Rating must be a number between 0 and 10']
    }
})

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;