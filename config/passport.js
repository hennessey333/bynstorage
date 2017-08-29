// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            console.log("bb", user)
            if (err)
                return done(err);

            // console.log('firstname: ' + req.body.firstname)

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            }

            if (password !== req.body.password_confirmation) {
                return done(null, false, req.flash('signupMessage', 'Your passwords do not match.'));
            }

            if (req.body.firstname === '') {
                return done(null, false, req.flash('signupMessage', 'Please enter a valid first name.'));
            }

            if (req.body.lastname === '') {
                return done(null, false, req.flash('signupMessage', 'Please enter a valid last name.'));
            } 

            if (req.body.phone === '') {
                return done(null, false, req.flash('signupMessage', 'Please enter a valid phone number. E.g: (555) 555-5555'));
            } else {

                function formatPhoneNumber(s) {
                  var s2 = (""+s).replace(/\D/g, '');
                  var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
                  return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
                }

                var phone = formatPhoneNumber(req.body.phone);
                if (!phone) return done(null, false, req.flash('signupMessage', 'Please enter a valid phone number. E.g: (555) 555-5555'));


                // if there is no user with that email and all fields filled
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.password   = newUser.generateHash(password);
                newUser.local.email      = email;
                newUser.local.lastname   = req.body.lastname;
                newUser.local.firstname  = req.body.firstname;
                newUser.photo = 'https://s3-us-west-1.amazonaws.com/byn-user-images/user.jpg';
                newUser.bio = null;
                newUser.phone = phone;

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signin', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('signinMessage', 'That email address could not be found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('signinMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

};
