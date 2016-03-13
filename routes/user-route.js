
var router        = require('express').Router(),
    User          = require('../models/user'),
    Cart          = require('../models/cart'),
    async         = require('async'),

    passport      = require('passport'),
    passportConf  = require('../config/passport');  

//L O G I N - R O U T E S
router.get('/login', function(req, res) {//
  if (req.user) return res.redirect('/');//if request is user send them to the home route
  res.render('accounts/login', { message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {//using middleware from passport.js
  successRedirect: '/profile', //User.findOne function logic from passport.js
  failureRedirect:'/login',
  failureFlash: true
}));

//User login route to profile
router.get('/profile', function(req, res, next) { 
  User.findOne({ //call to database to and check if this user id excist..
    _id: req.user._id
  }, function(err, user) { // if it does not error
    if (err) return next(err);
    res.render('accounts/profile', { //if user exist render their profike
      user: user
    });
  });
});
// router.get('/profile', function(req, res) {
//   res.json(req.user);
// })

//**MODIFY** signup Route to include shopping-cart
router.get('/signup', function(req, res, next) {
  res.render('accounts/signup', {
    errors: req.flash('errors')
  });
});    

//S I G N  U P - R O U T E S
router.post('/signup', function(req, res, next) {

  //*MOD 2-
  async.waterfall([
      function(callback) {
        //*MOD-4 Move entire signup logic to here..
        var user = new User();

        user.profile.name = req.body.name; //based of our models->user.js Schema
        user.email = req.body.email;
        user.password = req.body.password;
        user.profile.picture = user.gravatar();
        // VALIDATION
        User.findOne({
          email: req.body.email
        }, function(err, existingUser) {

          if (existingUser) {
            req.flash('errors', 'Account with that email address already exists');
            // console.log(req.body.email + " already exist");//server side error handling
            return res.redirect('/signup');
          } else {
            user.save(function(err, user) { //user obect based of what it was crteated.
              if (err) return next(err); //callback from function argument next    
              callback(null, user); //*MOD 1-

            });
          }
        });
      },

      function(user) {
        //*MOD 5 new***
        var cart = new Cart();
        cart.owner = user._id;
        cart.save(function(err) {
          if (err) return next(err);
          //*MOD 3- Moved from signup() 
          req.logIn(user, function(err) { //adding session to server and cookie to browser with the logIn()..
            if (err) return next(err);
            res.redirect('/profile');
            // res.json('New user was created!'); for postman testing
          })
        })
      }
    ]) //waterfall close
});//sing up post Func()

//L O G O U T
router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');
});

//E D I T - responding a view with the extra data 
router.get('/edit-profile', function(req, res, next) {
  res.render('accounts/edit-profile', { message: req.flash('success')});
});

// 
router.post('/edit-profile', function(req, res, next) {
  User.findOne({ _id: req.user._id }, function(err, user) { //*find user with same ID as current logged in user

    if (err) return next(err);

     if (req.body.name) user.profile.name = req.body.name; //allow to replace data to the DB.. 
    if (req.body.address) user.address = req.body.address;

    user.save(function(err) { //allow to save users data
      if (err) return next(err);
      req.flash('success', 'Successfully Edited your profile');
      return res.redirect('/edit-profile');
    });
  });
});





module.exports = router;


