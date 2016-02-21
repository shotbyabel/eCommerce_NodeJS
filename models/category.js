  var mongoose    =   require('mongoose'),
      Schema      =   mongoose.Schema;

//**1. S C H E M A - A T T R I B U T E  F I E L D S
var CategorySchema = new Schema({
  name: { type: String,
  unique: true,
  lowercase: true }

});

module.exports = mongoose.model('Category', CategorySchema);
