var Cart = require('../models/cart');

module.exports = function(req, res, next) {

  if (req.user) { //*1- IF is a logged in user
    var total = 0; //2* create a new var to store the TOTAL of the product
    //*2 - use mongoose function 'findOne' to search for the owner who has the same ID as Cart owner
    Cart.findOne({
      owner: req.user._id
    }, function(err, cart) {
      //4* IF cart exist.. LOOP cart items lengtht ... 
      if (cart) {
        for (var i = 0; i < cart.items.length; i++) {
          //5** add total by quantity of products
          total += cart.items[i].quantity;
        }

        //set it to a local variable 'cart'
        res.locals.cart = total;

      } else {
        res.locals.cart = 0;
      }
      next();
    })
  } else {
    next();
  }
}