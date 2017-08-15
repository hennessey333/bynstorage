"use strict";

// Routes, with inline controllers for each route.

var express = require('express');
var router = express.Router();
var validator = require('express-validator');
// var bodyParser = require('body-parser');
var fs = require('fs');
var path = require('path');
//var Project = require('../model/project');
var strftime = require('strftime');
var algoliasearch = require('algoliasearch');

var client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
var index = client.initIndex('byns');
var Byn = require('./models/Byn')

index.setSettings({
  searchableAttributes: [
    'name',
    'location',
    'price',
    'size',
    'price',
    'description',
    'amenities',
    'start',
    'end'
  ],
  //customRanking: ['desc(popularity)'],
});

// GET home page

module.exports = function(app, passport) {

  var multer = require('multer');
  var upload = multer({ dest: './uploads'}); //,
  //  rename: function (fieldname, filename) {
  //    return filename;
  //  },
  // });

  app.get('/', function(req, res) {
    //res.sendFile(path.join(__dirname, 'public/index.ejs'))s
    res.render('index.ejs', { signinMessage: req.flash('signinMessage'), signupMessage: req.flash('signupMessage') })
  });

  // GET about us page
  app.get('/aboutus', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/aboutus.html'))
  });

  // GET how to rent page
  app.get('/howtorent', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/howtorent.html'))
  });

  // GET how to host page
  app.get('/howtohost', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/howtohost.html'))
  });

  // GET FAQ page
  app.get('/faq', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/faq.html'))
  });

  // GET Terms of Use page
  app.get('/termsofuse', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/termsofuse.html'))
  });

  // GET Privacy Policy page
  app.get('/privacypolicy', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/privacypolicy.html'))
  });

  // GET Privacy Policy page
  app.get('/profile', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/profile.html'))
  });

  // GET search page
  app.get('/search', function(req, res) {
    // req.checkBody('where', 'A location is required.').notEmpty();
    // req.checkBody('when', 'A date range is required.').notEmpty();
    // var errors = req.validationErrors();
    // console.log(errors);
    res.sendFile(path.join(__dirname, 'public/search/index.html'))
  });

  app.get('/host', isLoggedIn, function(req, res) {
    res.render('host1', {
        user : req.user // get the user out of session and pass to template
    });
  });

  app.post('/host2', upload.array('photos'), function(req, res) {
    console.log("req.body", req.body);
    if (req.body.endAvailabilityRadio === 'Yes') {
      var range = req.body.when.split(' ');
      var start = range[0];
      var end = range[2];
    }
    else {
      var start = req.body.dateStart;
      var end = null;
    }
    console.log("req.files", req.files) //, req.file.photos, req.files.photos.path, req.files.photos.name)
    new Byn({
      location: req.body.location,
      type: req.body.type,
      name: req.body.name,
      description: req.body.description,
      amenities: req.body.amenities,
      size: req.body.sqFeet,
      price: req.body.price,
      start: start,
      end: end,
      photos: req.files,
      //{data: fs.readFileSync(req.files.photos.path + req.files.photos.name), contentType: req.files.photos.type},
      host: req.user
    }).save(function(err, byn) {
      if (err) {
        console.log("Error", err);
      }
      else {
        index.addObject({
          location: req.body.location,
          type: req.body.type,
          name: req.body.name,
          description: req.body.description,
          amenities: req.body.amenities,
          size: req.body.sqFeet,
          price: req.body.price,
          start: start,
          end: end,
          photos: req.files,
          host: req.user
        }, byn._id, function(err, content) {
          //console.log('objectID=' + content.objectID);
          if (err) console.log("Error", err);
          else res.redirect('/profile');
        });
      }
    });
  });

  // // POST home page to search page
  // app.post('/search', function(req, res) {
  //   req.checkBody('where', 'A location is required.').notEmpty();
  //   req.checkBody('when', 'A date range is required.').notEmpty();
  //   var errors = req.validationErrors();
  //   console.log(errors);
  //   console.log("Body: " + JSON.stringify(req.body));
  //   res.sendFile(path.join(__dirname, 'search/index.html'))
  // });

  // add routes for individual homes by doing a link with ex:   /search/:houseID
  // to access the value of this houseID from the params, use req.params.houseID
  // search the database using that ID and get relevant info
  // display that info using either handlebars or jquery (or even react)

  // =====================================
  // PROFILE SECTION =====================
  // =====================================
  // we will want this protected so you have to be logged in to visit
  // we will use route middleware to verify this (the isLoggedIn function)
  app.get('/home', isLoggedIn, function(req, res) {
      res.render('home', {
          user : req.user // get the user out of session and pass to template
      });
  });

  // =====================================
  // LOGOUT ==============================
  // =====================================
  app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
  });

  app.post('/signup', passport.authenticate('local-signup', {
      successRedirect : '/home', // redirect to the secure profile section
      failureRedirect : '/', // redirect back to the home page if there is an error
      failureFlash : true // allow flash messages
  }));

  // process the login form
  app.post('/signin', passport.authenticate('local-signin', {
      successRedirect : '/home', // redirect to the secure profile section
      failureRedirect : '/', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
  }));

}


// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()){
        return next();
    }

    // if they aren't redirect them to the home page
    console.log("3")
    res.redirect('/');
}
