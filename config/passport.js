//IGNORE THIS
var passport      = require('passport'), //authentication
    LocalStrategy = require('passport-local').Strategy; //for local login
    User          = require('../models/user');


// S E R I A L I Z E  && D E S E R I A L I Z E
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function(err, user) { //this id, is from the serializeUser id
    done(err, user);
  });
});

// M I D D L E W A R E 
passport.use('local-login', new LocalStrategy({ //add an instance of localStrategy
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done) {
  User.findOne({ email: email}, function(err, user) { //if we find that email in our DB: RUN THE CODE
    if (err) return done(err);

    if (!user) {
      return done(null, false, req.flash('loginMessage', "User Not Found!")); //if user is NOT found
    }

    if (!user.comparePassword(password)) { //from models user.js line 53?
      return done(null, false, req.flash('loginMessage', "Wrong password, try again!")); //if user uses wrong password
    }
      return done(null, user);
  });

}));


//F U N C T I O N for V A L I D A T I O N 
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


