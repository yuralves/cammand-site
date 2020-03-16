// ./srv/routers/middleware.js


// Create middleware pbject to be exported
var middlewareObj ={}

// Route middleware to make sure user is logged in
middlewareObj.isLoggedIn = function isLoggedIn(req, res, next) {
	
		// if user is authenticated in the session, carry on
		if (req.isAuthenticated()) {
			return next();
		}
	
		// if they aren't redirect them to the login page
		res.redirect('/restricted/login');
}

middlewareObj.isAdmin = function isAdmin(req, res, next) {
	
		// if user is authenticated in the session, carry on
		if (req.isAuthenticated() && req.user.local.userType == 'Admin') {
			console.log('Admin');
			return next();
		}
	
		// if they aren't redirect them to the login page
		console.log('Not Admin');
		res.redirect('/restricted/login');
}

	
module.exports = middlewareObj;