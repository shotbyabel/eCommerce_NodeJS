var router  = require('express').Router(),
    User    = require('../models/user');


router.get('/signup', function(req, res, next) {
  res.render('accounts/signup', {
    errors: req.flash('errors')
  });
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
      req.flash('errors', 'That e-mail has already been registed');
      // console.log(req.body.email + " already exist");//server side error handling
      return res.redirect('/signup');
    } else {
      user.save(function(err, user) {
        if (err) return next(err); //callback from function argument next
        return res.redirect('/');
        // res.json('New user was created!'); for postman testing
      });
    }
  }); //mongoose query 
});

module.exports = router;