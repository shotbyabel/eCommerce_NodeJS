var router    = require('express').Router();
var User      = require('../models/user');
var Product   = require('../models/product');
var Cart      = require('../models/cart');
var async     = require('async');

var stripe    = require('stripe') ('sk_test_9ALQ3o2Sa4ABdNfqePQHOjZa');



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
//C A R T - R O U T E S:

router.get('/cart', function(req, res, next) {
  Cart
  //SEARCH in the db if  req.user._id exist or not
    .findOne({
      owner: req.user._id
    })
    .populate('items.item')//populate image, name, price 
    .exec(function(err, foundCart) {
      if (err) return next(err);
      res.render('main/cart', {//render view of the owner/user cart
        foundCart: foundCart,//we are looping cart object in cart.ejs
        message: req.flash('remove')
      });
    });
});

//this POST Method will run when user push "Add to Cart" button on product.ejs
router.post('/product/:product_id', function(req, res, next) {
      //find owner of the cart!
      Cart.findOne({
          owner: req.user._id
        }, function(err, cart) {
          cart.items.push({ //push items based on req.body we want to buy (item is an array)
            item: req.body.product_id,
            price: parseInt(req.body.priceValue), //parseInt
            quantity: parseInt(req.body.quantity)
          });
          //parse value of the req.body to a float data type: saving to DB wont show errors(playing it safe)
          cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);
          //save it to the cart DB
          cart.save(function(err) {
            if (err) return next(err);
            return res.redirect('/cart');
          });
        });
      });

//Remove Item from CART Route

router.post('/remove', function(req, res, next) {
  //*ir order to remove the item we must get it's _id
  Cart.findOne({
     owner: req.user._id
  }, function(err, foundCart) {
    //once the item is found we pull it.. 
    foundCart.items.pull(String(req.body.item));
//subtract the total price once item has been removed from cart
    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save(function(err, found) {
      if (err) return next(err);
      req.flash('remove', 'Item was removed from your cart');
      res.redirect('/cart');
    });
  });
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

//S T R I P E - R O U T E

router.post('/payment', function(req, res, next) {

  var stripToken = req.body.stripToken; //get strip Token from Client-side
  var currentCharges = Math.round(req.body.stripeMoney * 100); //we r timing by 100(cents)
  stripe.customers.create({ //stripe method to create customers..
    source: stripToken,

  }).then(function(customer) { //promise handler
    return stripe.charges.create({ //add all the info to charge the customer..
      amount: currentCharges,
      currency: 'usd',
      customer: customer.id
    });
  }).then(function(charge) { //refactor here with async *starts* .then
//////////////////////////////////////////////////////////
//////async library waterfall method w/3 functions inside
    async.waterfall([
//**1**search for the cart      
      function(callback) {
        Cart.findOne({ //found the cart! let's pass it down to the next function
          owner: req.user._id
        }, function(err, cart) {
          callback(err, cart);//pass the 2nd argument 'cart' to our **2nd** function
        });
      },
//**2** 'cart' is passed search for the User!         
      function(cart, callback) {
        User.findOne({
          _id: req.user._id
        }, function(err, user) { //pass user to our **3rd funtion**
          //IF user does exist, we forLoop the end/length
          if (user) {
            for (var i = 0; i < cart.items.length; i++) {
              //for every loop we want to push/add the following params to the users history:(we uncommented items in the user models)
              user.history.push({//all these params and values are from our User Schema.. models
                item: cart.items[i].item,
                paid: cart.items[i].price
              });
            }
//after we add/push items and prices SAVE the user..
            user.save(function(err, user) { //pass user to our **3rd funtion**
              if (err) return next(err);
              callback(err, user);
            });
          }
        });
      }, 
//**3**  finally Update the user's cart!        
      function(user) {
        Cart.update({
          owner: user._id
        }, {
          $set: { //$set is the same as `cart.items = []`
            items: [],
            total: 0 //after payment is clear price goes back to ZERO
          }
        }, function(err, updated) {
          if (updated) {
            res.redirect('/profile');
          }
        });
      }
    ]);
  });
});

module.exports = router;

// router.get('/users', function(req, res) {
//   User.find({}, function(err, users) {
//     res.json(users);
//   })
// })
