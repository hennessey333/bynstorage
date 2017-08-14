"use strict";

// Project model
var mongoose = require('mongoose');

var Listing = mongoose.model('Listing', {
	location: {
    	type: String,
    	required: true 
  	},
	type: {
		type: String,
		required: true
	},
	name {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	ammenities: {
		type: String
	}
	size: {
		type: String,
		required: true
	},
	price: {
		type: Number,
		required: true
	},
	photos: {
		required: true
	},
	date: {
		type: String,
    	required: true
	}
});

module.exports = {
  Project: Project
}