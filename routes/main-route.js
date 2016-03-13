var router    = require('express').Router();
var User      = require('../models/user');
var Product   = require('../models/product');

function paginate(req, res, next) {

  var perPage = 9;
  var page = req.params.page;

  Product
    .find()
    .skip(perPage * page) //skips the amount of documents 9 x 2 = 18
    .limit(perPage) //limit how many products/docs we wamnt per query..(9)
    .populate('category')
    .exec(function(err, products) {
      if (err) return next(err);
      Product.count().exec(function(err, count) { //mongoose method '.count()' to count how many documents in product db 
         if (err) return next(err);
        res.render('main/product-main', {
          products: products,
          pages: count / perPage //count products and divide it by 9
        });
      });
    });
}
//////////////////////////////////////////////////////////////////////////////////
// createMapping is method to connect Product database to Elastic Search
Product.createMapping(function(err, mapping) {
  if (err) {
    console.log("error creating mapping");
    console.log(err);
  } else {
    console.log("Mapping created");
    console.log(mapping);
  }
});
// //THREE methods.. count the docs..close the count.. errors
var stream = Product.synchronize(); //syncs whole product in the elastic search replica set(replicate all data and put in in Elasti Search)
var count = 0;
//
stream.on('data', function() {
  count++;
});

stream.on('close', function() {
  console.log("Indexed " + count + " documents");
});

stream.on('error', function(err) {
  console.log(err);
});
//////////////////////////////////////////////////////////
//S E A R C H  R O U T E S: go to search route and pass req.body.q.
router.post('/search', function(req, res, next) {
  res.redirect('/search?q=' + req.body.q);
});

//req.query is usually to access data in search?q= "the name of the query"

router.get('/search', function(req, res, next) { //RETREIVE data from post route above..
  if (req.query.q) {
    Product.search({ //search the req.query value
      query_string: {
        query: req.query.q //it will search ElasticSeach replica set
      }
    }, function(err, results) {
      if (err) return next(err);
      //return our results: we do the code below so that we don't get a big nested object. only the whats in SECOND hits:{ _source }
      //that's why we are using .map = so we can STORE it in a new array []
      var data = results.hits.hits.map(function(hit) {
        return hit;
      });
      res.render('main/search-result', {
        query: req.query.q,
        data: data //the var data = results....
      });
    });
  }
})
////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////
router.get('/', function(req, res, next) {
  //**update home route to add PAGINATION**
  if (req.user) {
    paginate(req, res, next); //**ADD THIS FUNCTION from above***
  } else {
    res.render('main/home');//if user is NOT logged in render the regular home page..
  }

});

////////NEW PAGE ROUTE FOR//// product-main.ejs pagination route
router.get('/page/:page', function(req, res, next) {
  //<li><a href="/page/<%= i %>"><%= i %></a></li>
  paginate(req, res, next);

});


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

// router.get('/users', function(req, res) {
//   User.find({}, function(err, users) {
//     res.json(users);
//   })
// })
