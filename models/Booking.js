// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var bookingSchema = mongoose.Schema({
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    byn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Byn',
        required: true
    },
    movein: String,
    notes: String,
    start: {
        type: Number,
        required: true
    },
    end: {
        type: Number,
        required: true
    },
    isConfirmed: Boolean
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Booking', bookingSchema);
