var   mongoose    =   require('mongoose'),
      Schema      =   mongoose.Schema;

//**1. S C H E M A - A T T R I B U T E  F I E L D S
var ProductSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category'},
  name: String,
  price: Number,
  image: String 
});



module.exports = mongoose.model('Product', ProductSchema);