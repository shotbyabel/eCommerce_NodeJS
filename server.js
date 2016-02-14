var express     = require('express'),
    morgan      = require('morgan'),//logs HTTP methods on our terminal
    mongoose    = require('mongoose'),
    bodyParser  = require('body-parser'),
    ejs         = require('ejs'),
    engine      = require('ejs-mate'),

    User        = require('./models/user'),

    app         = express();//app is refering to the express object.

    mongoose.connect('mongodb://root:fuckOaxaca001@ds061325.mongolab.com:61325/ecommerce_abel', function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("MongDB is running Login to Mongolab.com");
      }

    });
    

//M I D D L E W A R E
app.use(express.static(__dirname + '/public'));//tell express to serve static files
app.use(morgan('dev'));
app.use(bodyParser.json());//express app can now parse JSON data! 
app.use(bodyParser.urlencoded({ extended: true }));
//set our engines
app.engine('ejs', engine); //
app.set('view engine', 'ejs'); //

//R O U T E S required from model.exports
var mainRoutes = require('./routes/main-route');
var userRoutes = require('./routes/user-route.js');
app.use(mainRoutes);
app.use(userRoutes);

// listen method: We are running the server on port 3000
app.listen(3000, function(err) { // error handlers are good practice
  if (err) throw err;
  console.log("NodeJs Oh how I missed ya!<3"); //check when it does work
});

///TESTING  ON  P O S T M A N
// app.post('/create-user', function(req, res, next) {
//   var user = new User();

//   user.profile.name = req.body.name; //based of our models->user.js Schema
//   user.password     = req.body.password;
//   user.email        = req.body.email;

//   user.save(function(err) {
//     if (err) return next(err);//callback from function argument next

//     res.json("Success, User created!");

//   })

// });
///END - P O S T M A N : testing    

///R O U T E S
// app.get('/', function(req, res) {
//   res.render('main/home');
// })



//H O M E  R O U T E
// app.get('/', function(req, res) {
//   var name = "Abel";
//   res.json("The most dope dude is " + name);

// })

// app.get('/catname', function(req, res) {
//   res.json('Kittie');
// });



// // listen method: We are running the server on port 3000
// app.listen(3000, function(err) { // error handlers are good practice
//   if (err) throw err;
//   console.log("Your Server is Runing! :D"); //check when it does work
// });
