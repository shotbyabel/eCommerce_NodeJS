var express       = require('express'),
    morgan        = require('morgan'),//logs HTTP methods on our terminal
    mongoose      = require('mongoose'),
    bodyParser    = require('body-parser'),
    ejs           = require('ejs'),
    engine        = require('ejs-mate'),
    session       = require('express-session'), //
    cookieParser  = require('cookie-parser'),//store session IDs for users
    flash         = require('express-flash'),
    MongoStore    = require('connect-mongo/es5')(session), //to store session on server side
    passport      = require('passport'),

    secret        = require('./config/secret'),
    User          = require('./models/user'),
    Category      = require('./models/category'),
    Product       = require('./models/product'),

    app           = express();//app is refering to the express object.

    mongoose.connect(secret.database, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("MongDB is running Login to Mongolab.com");
      }

    });
    
////////////////////////////////////////////////////
// - M I D D L E W A R E -
app.use(express.static(__dirname + '/public'));//tell express to serve static files
app.use(morgan('dev'));
app.use(bodyParser.json());//express app can now parse JSON data! 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: new MongoStore({ url: secret.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize()); //tell express to use it
app.use(passport.session()); //need it for serialize and deserialize

//all routes will have user object by default
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

//middleware for category queries
app.use(function(req, res, next) {
  Category.find({}, function(err, categories) {//find SPECIFIC category search query ={} or you want to find all
    if (err) return next(err);
    res.locals.categories = categories;//then store the list of categories in a local var 'categories'
    next();//callback
  });
});

//set our engines
app.engine('ejs', engine); //
app.set('view engine', 'ejs'); //

/////////////////////////////////////////////////
// - R O U T E S - required from model.exports
var mainRoutes = require('./routes/main-route');
var userRoutes = require('./routes/user-route');
//*Admin Routes*
var adminRoutes = require('./routes/admin-route');

var apiRoutes  = require('./api/api');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);
// listen method: We are running the server on port 3000
app.listen(secret.port, function(err) { // error handlers are good practice
  if (err) throw err;
  console.log("Nodemon Server running on " + secret.port); //check when it does work
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
