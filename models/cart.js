  var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

  //**1. S C H E M A - A T T R I B U T E  F I E L D S
  var CartSchema = new Schema({
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    //total price
    total: {
      type: Number,
      default: 0
    },
    //array of items that user will buy
    items: [{
      item: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
      },
      quantity: {
        type: Number,
        default: 1
      },
      //price for each item
      price: {
        type: Number,
        default: 0
      },
    }]

  });

  module.exports = mongoose.model('Cart', CartSchema);