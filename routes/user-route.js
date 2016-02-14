var router  = require('express').Router(),
    User    = require('../models/user');


router.get('/signup', function(req, res, next) {
  res.render('accounts/signup')
});    


router.post('/signup', function(req, res, next) {
  var user = new User();

  user.profile.name = req.body.name; //based of our models->user.js Schema
  user.email = req.body.email;
  user.password = req.body.password;

  // VALIDATION
  User.findOne({
    email: req.body.email
  }, function(err, existingUser) {

    if (existingUser) {
      console.log(req.body.email + " already exist");
      return res.redirect('/signup');
    } else {
      user.save(function(err, user) {
        if (err) return next(err); //callback from function argument next

        res.json('New user was created!');
      });
    }
  }); //mongoose query 
});

module.exports = router;