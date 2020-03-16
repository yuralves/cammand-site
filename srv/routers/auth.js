// srv/routers/auth.js

// set up ======================================================================
// get all the tools we need
var express       = require('express'),
    app           = express(),
    router        = express.Router(),
    mongoose      = require('mongoose'),
    passport      = require('passport'),
    flash         = require('connect-flash'),
    User          = require("../models/user.js"),
    morgan  	  = require('morgan'),
    cookieParser  = require('cookie-parser'),
    bodyParser	  = require('body-parser'),
    session 	  = require('express-session'),
    path          = require('path');

// configuration ===============================================================

// configure Mongoose connection to MongoDB database
mongoose.connect(process.env.MONGODB_URI); // connect to our database
// get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
// get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

require('../config/passport.js')(passport); // pass passport for configuration

// set up our service
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true})); // body-parser config: get information from html forms

// views and ejs configuration
app.set('view engine', 'ejs'); // set up ejs for templating
app.set('views', path.join(__dirname, '../../www/views'));

// session config - needed for passport
app.use(session({             // express-session config
    secret: 'cryptohfcftrader',
    resave: false,
    saveUninitialized: false
}));

// passport intialization
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(flash()); // use connect-flash for flash messages stored in session

// configures current user and success/error messages to be passed through app
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

// routes ======================================================================
require('./authRoutes.js')(router, passport); // load our routes and pass in our router and fully configured passport

app.use(router);

// export login service ======================================================================
module.exports = app;