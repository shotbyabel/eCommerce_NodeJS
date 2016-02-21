var router        = require('express').Router(),
    Category      = require('../models/category');
//get view or data fromthe server w/ a flash message if 'succesful'
    router.get('/add-category', function(req, res, next) {
      res.render('admin/add-category', { message: req.flash('success')})
    });

    router.post('/add-category', function(req, res, next) {
      var category = new Category();//create new Category-ref the schema
      category.name = req.body.name;//store it in the category field and name

      category.save(function(err) { //let's save it into our database
        if (err) return next(err);
        req.flash('success', 'Your category has been added');
        return res.redirect('/add-category');//back to the add category page.
      });
    })

    module.exports = router;