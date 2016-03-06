var mongoose = require('mongoose');
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;
//**1. S C H E M A - A T T R I B U T E  F I E L D S
var ProductSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category'},
  name: String,
  price: Number,
  image: String
});
//Adding plugin to our producSchema
ProductSchema.plugin(mongoosastic, {
  hosts: [
    'localhost:9200'
  ]
});

module.exports = mongoose.model('Product', ProductSchema);