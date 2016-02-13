var express   = require('express'),
    morgan    = require('morgan'),//logs HTTP methods on our terminal
    mongoose  = require('mongoose'),

    app       = express();//app is refering to the express object.

    mongoose.connect('mongodb://root:@ds061325.mongolab.com:61325/ecommerce_abel', function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("BOW DOWN TO MONGO BIIIATCH- WE LIVE!!!");
      }

    });

//M I D D L E W A R E
app.use(morgan('dev'));    

//H O M E  R O U T E
app.get('/', function(req, res) {
  var name = "Abel";
  res.json("The most dope dude is " + name);

})

app.get('/catname', function(req, res) {
  res.json('Kittie');
});



// listen method: We are running the server on port 3000
app.listen(3000, function(err) { // error handlers are good practice
  if (err) throw err;
  console.log("Your Server is Runing! :D"); //check when it does work
});
