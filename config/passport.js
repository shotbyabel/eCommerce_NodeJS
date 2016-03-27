//IGNORE THIS
var passport          = require('passport'), //authentication
    LocalStrategy     = require('passport-local').Strategy, //for local login
    FacebookStrategy  = require('passport-facebook').Strategy,
    secret            = require('../config/secret'),
    User              = require('../models/user'),

    async             = require('async'),
    Cart              = require('../models/cart');



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


//F A C E B O O K - OAUTH - M I D D L E W A R E 
//show passport how to auth w/facebook (pass in facebook object info) callback function..
passport.use(new FacebookStrategy(secret.facebook, function(token, refreshToken, profile, done) {
  User.findOne({
    facebook: profile.id
  }, function(err, user) {
    if (err) return done(err);

    if (user) {
      return done(null, user);

    } else {
      //facebook user cart refactor w/async waterfall
      async.waterfall([
          function(callback) { //1 create new user object 
            var newUser = new User();
            newUser.email = profile._json.email; //data
            newUser.facebook = profile.id;
            newUser.tokens.push({
              kind: 'facebook',
              token: token
            });
            newUser.profile.name = profile.displayName; //set their display name
            newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';

            newUser.save(function(err) {
              if (err) throw err;
            //2. call back with a new users object to the next function     
              callback(err, newUser);
            });

          },
            //3. create a new Cart object and set it to the new user_id 
          function(newUser) { //pass new FB user id and pass it to the cart
            var cart = new Cart();
            cart.owner = newUser._id;
            //save cart
            cart.save(function(err) {
              if (err) return done(err);
              //5. callback w/ new user object so route can auth and redirect user
              return done(err, newUser)
            })
          },
        ]) //waterfall END   

    }
  });
}));


//F U N C T I O N for V A L I D A T I O N 
//**we added this middleware over at the user-route.js (`router.post('/login', `)
//USER has to be authenticated in order to enter this route..
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}


