"use strict";

// Routes, with inline controllers for each route.

var express = require('express');
var router = express.Router();
var validator = require('express-validator');
var path = require('path');
//var Project = require('../model/project');
var strftime = require('strftime');

// GET home page

module.exports = function(app, passport) {

  app.get('/', function(req, res) {
    //res.sendFile(path.join(__dirname, 'public/index.ejs'))s
    res.render('index.ejs', { signinMessage: req.flash('signinMessage'), signupMessage: req.flash('signupMessage') })
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
        return next();
    }

    // if they aren't redirect them to the home page
    res.redirect('/');
}
