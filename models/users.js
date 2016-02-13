  var mongoose    =   require('mongoose'),
      bcrypt      =   require('bcrypt-nodejs'),
      Schema      =   mongoose.Schema;

    //1. U S E R  - S C H E M A - A T T R I B U T E  F I E L D S
var UserSchema = new Schema({

  email: {
    type: String,
    unique: true
  },
  password: String,

  profile: {
    name: {
      type: String,
      default: ''
    },
    picture: {
      type: String,
      default: ''
    }

  },

  address: String,
  history: [{
    date: Date,
    paid: {
      type: Number,
      default: 0
    },
    // item: { type: Schema.Types.ObjectId, ref: ''} //
  }]
});

//2. H A S H / S A V E -  P A S S W O R D - before saving to databse
UserSchema.pre('save', function(next) {//pre is a mongoose method
  //BEFORE we save it into the DB we need to do the following
  var user = this; // cretea a new object that refers to THIS UserSchema(just an object)
  if(!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) { //randome data created  - up t0 10 randome characters generated?
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next(); //run the call back once this whole method is done.
    });
  });
});

//3. C O M P A R E  P A S S W O R D in DB to USER INPUTS
UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compareSync(password, this.password); //bcrypt method to handle comparing
} //methods created by me

module.exports = mongoose.model('User, UserSchema');//export the whole schema so other files can use it.




