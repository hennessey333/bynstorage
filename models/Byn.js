// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var bynSchema = mongoose.Schema({
    location: {
        type: String,
        required: true
    },
    _geoloc: {
        type: Object,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Garage', 'Closet', 'Basement', 'Bedroom', 'Business', 'Attic', 'Other']
    },
    name: String,
    description: String,
    amenities: Array,
    size: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    times: Array,
    // start: {
    //     type: String,
    //     required: true
    // },
    // end: {
    //     type: String,
    //     //required: true
    // },
    photos: {
        // data: Buffer,
        // contentType: String,
        type: Array,
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// methods ======================


// create the model for users and expose it to our app
module.exports = mongoose.model('Byn', bynSchema);
