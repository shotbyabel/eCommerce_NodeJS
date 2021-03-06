var router = require('express').Router(),
  async = require('async'),
  faker = require('faker'),

  Category = require('../models/category'),
  Product = require('../models/product');

   /////////////////////////////////////// 
  //S E A R C H - API  R O U T E 

router.post('/search', function(req, res, next) {//*1 url as search (different endPoint than in main-route.js)
  console.log(req.body.search_term);
  Product.search({ //*2 mongoosastic .search method : to search for product! 
    query_string: {
      query: req.body.search_term//3* will search based on what we input (body.search_term)
    }

  }, function(err, result) {
    if (err) return next(err);
    //4* respond data in JSON format so we can feed it to our AJAX call custom.js file in the feature.
    res.json(result); //returning json formatted data (reference ajax call in custom.js)
  });
});


router.get('/:name', function(req, res, next) {//1**search category based on name WE type in the url

  async.waterfall([ //async 'waterfall' function //we have 2 functions [ 0, 1] 
    //2**we find a category of the name typed in url.. will be searh "electronics"
    function(callback) { //index 0
      Category.findOne({//finding category by _id
        name: req.params.name //"electronics for example"
      }, function(err, category) {
        if (err) return next(err);
        callback(null, category);//3**if is FOUND pass it in a callback.. 
      });
    },
  //4**once is passed to this function it will use category
    function(category, callback) { //index 1
      for (var i = 0; i < 10; i++) {//loop 10 times: basically create 10.. 
        var product = new Product();//create new an instance of new product
        product.category = category._id;//gets it from Category.findOne query
        //everything below here will belong to THAT 'electronics' category
        product.name = faker.commerce.productName();//set the name, etc. 'commerce' comes from the faker library
        product.price = faker.commerce.price();
        product.image = faker.image.image();//image is also part of faker library
        //https://github.com/marak/Faker.js/

        product.save();
      }
    }
  ]);

  res.json({
    message: "Success"
  });
}); //router.get

module.exports = router;