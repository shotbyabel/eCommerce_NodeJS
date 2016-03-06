var router    = require('express').Router();
var User      = require('../models/user');
var Product   = require('../models/product');


router.get('/', function(req, res) {
  res.render('main/home');
})

// router.get('/users', function(req, res) {
//   User.find({}, function(err, users) {
//     res.json(users);
//   })
// })

//first we get route with url name and we added a param ':id'
router.get('/products/:id', function(req, res, next) {
  Product
    .find({ //the QUERY 'objectId' from the models in the product.js 
      category: req.params.id //this is why we use req.params ->access by the id of the category
    })
    .populate('category') //.populate ONLY if a data type is an `objectId` (also from models / product.js)
    .exec(function(err, products) {//if there are more than 1 method we use exec
      if (err) return next(err);
      res.render('main/category', {
        products: products //what we are looping [] from in categories.ejs
      });
    });
});

//SHOW ME SINGLE product page
router.get('/product/:id', function(req, res, next) {//QUERY based on id(particular product)
  Product.findById({
    _id: req.params.id
  }, function(err, product) { //product is cb and will pass it to the ejs file 'product.ejs'
    if (err) return next(err);
    res.render('main/product', {
      product: product
    });
  });
});

module.exports = router;