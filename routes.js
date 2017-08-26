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
var algoliasearchHelper = require('algoliasearch-helper');

var client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_ADMIN_KEY);
var algoliaHelper = algoliasearchHelper(client, 'byns');

var index = client.initIndex('byns');
var Byn = require('./models/Byn')
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var S3_BUCKET = process.env.AWS_BUCKET;

var s3 = new aws.S3();
var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET,
    acl: 'public-read',
    metadata: function(req, file, cb) {
      console.log(file);
      cb(null, file);
    }
  })
});

index.setSettings({
  searchableAttributes: [
  'name',
  'location',
  'type',
  'size',
  'price',
  'description',
  'amenities',
  ],
  attributesForFaceting: [
  'price',
  'size',
  'type'
  ],
  ranking: [
  'geo'
  ]
  //customRanking: ['desc(popularity)'],
});

// GET home page

module.exports = function(app, passport) {

  app.get('/', function(req, res) {
    //res.sendFile(path.join(__dirname, 'public/index.ejs'))s
    if (req.user) {
      res.render('home', {
        user : req.user // get the user out of session and pass to template
      });
    }
    else res.render('index.ejs', { signinMessage: req.flash('signinMessage'), signupMessage: req.flash('signupMessage') })
  });

  // GET about us page
  app.get('/aboutus', function(req, res) {
    res.render('aboutus', {
      user : req.user,
      signinMessage: req.flash('signinMessage'),
      signupMessage: req.flash('signupMessage')
    });
  });

  // GET how to rent page
  app.get('/howtorent', function(req, res) {
    res.render('howtorent', {
      user : req.user,
      signinMessage: req.flash('signinMessage'),
      signupMessage: req.flash('signupMessage')
    });
  });

  // GET how to host page
  app.get('/howtohost', function(req, res) {
    res.render('howtohost', {
      user : req.user,
      signinMessage: req.flash('signinMessage'),
      signupMessage: req.flash('signupMessage')
    });
    // res.sendFile(path.join(__dirname, 'public/howtohost.html'))
  });

  // GET FAQ page
  app.get('/faq', function(req, res) {
    res.render('faq', {
      user : req.user,
      signinMessage: req.flash('signinMessage'),
      signupMessage: req.flash('signupMessage')
    });
  });

  // GET Terms of Use page
  app.get('/termsofuse', function(req, res) {
    res.render('termsofuse', {
      user : req.user,
      signinMessage: req.flash('signinMessage'),
      signupMessage: req.flash('signupMessage')
    });
  });

  // GET Privacy Policy page
  app.get('/privacypolicy', function(req, res) {
    res.render('privacypolicy', {
      user : req.user,
      signinMessage: req.flash('signinMessage'),
      signupMessage: req.flash('signupMessage')
    });
  });

  // GET Profile page
  app.get('/profile', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/profile.html'))
  });

  // GET Bookings page
  app.get('/bookings', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/bookings.html'))
  });

  // POST Bookings: Make new booking
  app.post('/bookings', function(req, res) {
    var startMs = req.body.start;
    var endMs = req.body.end;
    var startNext = startMs + (24 * 60 * 60 * 1000);
    var endNext = endMs + (24 * 60 * 60 * 1000);
    // var startDate = new Date(startMs);
    // var endDate = new Date(endMs);
    // var startNext = startDate.setDate(startDate.getDate() + 1).toLocaleDateString('en-US');
    // var endNext = endDate.setDate(endDate.getDate() + 1).toLocaleDateString('en-US');
    var host = null;
    Byn.findById(req.body.mongoId)
    .then(function(byn) {
      host = byn.host;
      for (var i = 0; i < byn.times.length; i++) {
        var startDb = byn.times[i].start;
        var endDb = byn.times[i].end;
        if (startDb === startMs && endDb === endMs) {
          byn.times.splice(i, 1);
          break;
        }
        else if (startDb === startMs && endDb > endMs) {
          byn.times[i].start = startNext;
          break;
        }
        else if (startDb < startMs && endDb === endMs) {
          byn.times[i].end = endNext;
          break;
        }
        else if (startDb < startMs && endDb > endMs) {
          var temp = byn.times[i].end;
          byn.times[i].end = startNext;
          byn.times.push({start: endNext, end: temp});
          break;
        }
      }
    })
    .then(new Booking({
      host: host,
      client: req.user,
      byn: req.body.mongoId,
      movein: req.body.deliveryTime,
      notes: req.body.deliveryNotes,
      start: req.body.start,
      end: req.body.end,
    }).save())
    .catch(function(err) {
      console.log("Caught error", err);
    })

    index.getObject(req.body.algId, function(err, byn){
      if (err) console.log("Error", err);
      else {
        if (byn.start === startMs && byn.end > endMs) {
          byn.start = startNext;
        }
        else if (byn.start < startMs && byn.end === endMs) {
          byn.end = endNext;
        }
        else if (byn.start < startMs && byn.end > endMs) {
          var temp = byn.end;
          byn.end = startNext;
          index.addObject({
            name: byn.name,
            location: byn.location,
            price: byn.price,
            size: byn.size,
            description: byn.description,
            amenities: byn.amenities,
            _geoloc: byn._geoloc,
            type: byn.type,
            photos: byn.photos,
            host: byn.host,
            bynref: byn.bynref,
            start: endNext,
            end: byn.end
          }, function(err, content) {
            if (err) console.log("Error", err);
          });
        }
        else if (byn.start === startMs && byn.end === endMs) {
          index.deleteObject(req.body.algId, function(err){ if (err) console.log("Error", err); });
        }
        else {
          console.log("Uh-oh - algolia object not found?")
        }
      }
    })

    res.redirect('/bookings');
    //res.sendFile(path.join(__dirname, 'public/bookings.html'))
  });

  // GET Messages page
  app.get('/messages', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/messages.html'))
  });

  // GET Payment page
  app.get('/payment', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/payment.html'))
  });

  // GET search page
  app.post('/search', function(req, res) {
    // req.checkBody('where', 'A location is required.').notEmpty();
    // req.checkBody('when', 'A date range is required.').notEmpty();
    // var errors = req.validationErrors();
    // console.log(errors);
    var lat = parseFloat(req.body.lat);
    var lng = parseFloat(req.body.lng);
    var where = req.body.where;
    var when = req.body.when;
    res.render('search.ejs', {lat, lng, where, when});
    //res.sendFile(path.join(__dirname, 'public/search/index.html'))
  });

  app.get('/host', isLoggedIn, function(req, res) {
    res.render('host1', {
        user : req.user // get the user out of session and pass to template
      });
  });

  app.post('/host2', upload.array('photos'), function(req, res) {
    console.log("req.body", req.body)
    console.log("req.files", req.files);
    if (req.body.endAvailabilityRadio === 'Yes') {
      var range = req.body.when.split(' ');
      var start = new Date(range[0]).getTime();
      var end = new Date(range[2]).getTime();
    }
    else {
      var start = new Date(req.body.dateStart).getTime();
      var end = 2.2e+14;
    }
    var photos = req.files.map(item => (item.location));
    console.log("req.body req.files", req.body, req.files);
    var urlParams = {Bucket: S3_BUCKET, Key: req.files.filename};

    var size = parseInt(req.body.sqFeet);
    var price = parseFloat(req.body.price).toFixed(2);
    new Byn({
      location: req.body.location,
      _geoloc: {
        lat: parseFloat(req.body.lat),
        lng: parseFloat(req.body.lng)
      },
      type: req.body.type,
      name: req.body.name,
      description: req.body.description,
      amenities: req.body.amenities,
      size: size,
      price: price,
      times: [{start, end}],
      // start: start,
      // end: end,
      photos: photos,
      host: req.user
    }).save(function(err, byn) {
      if (err) {
        console.log("Error", err);
      }
      else {
        index.addObject({
          location: req.body.location,
          _geoloc: {
            lat: parseFloat(req.body.lat),
            lng: parseFloat(req.body.lng)
          },
          type: req.body.type,
          name: req.body.name,
          description: req.body.description,
          amenities: req.body.amenities,
          size: size,
          price: price,
          start: start,
          end: end,
          photos: photos,
          host: req.user,
          bynref: byn._id
        }, byn._id, function(err, content) {
          if (err) console.log("Error", err);
          else res.redirect('/profile');
        });
      }
    });
  });

  app.get('/byn/:id', function(req, res){
    // index.getObject(req.params.id, function(err, byn) {
    //   if (err) {
    //     console.log("Error", err);
    //     res.end();
    //   }
    //   res.json({success: true, byn: byn});
    // });

    Byn.findById(req.params.id, function(err, byn){
      if (err) {
        console.log("Error", err);
        res.end();
      }
      else res.json({success: true, byn: byn});
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
      // successRedirect : '/home', // redirect to the secure profile section
      failureRedirect : '/', // redirect back to the signup page if there is an error
      failureFlash : true // allow flash messages
    }), function(req, res) {
    req.session.save(function(err) {
      res.redirect('/home')
    })
  });

}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated()){
      next();
    }

    // if they aren't redirect them to the home page
    else res.redirect('/');
  }
