// ./srv/routers/authRoutes.js

// Require middleware and user model files
var middleware = require('./middleware.js'),
	User       = require('../models/user');

module.exports = function(router, passport) {
	
	// =====================================
	// HOME ================================
	// =====================================
	// restricted area home
	router.get('/', function(req, res) {
		// redirects to login page
		res.redirect('/restricted/login');
	});
	
	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	router.get('/login', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('login', { message: req.flash('loginMessage') });
	});

	// process the login form
	router.post('/login', passport.authenticate('local-login', {
		successRedirect : '/restricted/dashboard', // redirect to the secure dashboard section
        failureRedirect : '/restricted/login',     // redirect back to the login page if there is an error
        failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIDEBAR =============================
	// =====================================
	router.get('/dashboard', middleware.isLoggedIn, function(req, res) {
		res.render('dashboard', { 
			user: req.user,
			message: req.flash('loginMessage') 
		});
	});
	router.get('/checkin', middleware.isLoggedIn, function(req, res) {
		res.render('checkin', { 
			user: req.user,
			message: req.flash('loginMessage') 
		});
	});
	router.get('/charge', middleware.isLoggedIn, function(req, res) {
		res.render('charge', { 
			user: req.user,
			message: req.flash('loginMessage') 
		});
	});
	router.get('/balance', middleware.isLoggedIn, function(req, res) {
		res.render('balance', { 
			user: req.user,
			message: req.flash('loginMessage') 
		});
	});
	router.get('/menu', middleware.isLoggedIn, function(req, res) {
		res.render('menu', { 
			user: req.user,
			message: req.flash('loginMessage') 
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	router.get('/logout', function(req, res) {
		req.session.destroy(function (err) {
			if(err){
				console.log(err);
				res.redirect("/restricted");
			}
    		res.redirect('/restricted'); 
		});
	});
};