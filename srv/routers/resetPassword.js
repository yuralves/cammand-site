// require the tools necessary
var	async	   = require('async'),
	crypto	   = require('crypto'),
	flash	   = require('connect-flash'),
	express    = require('express'),
	session    = require('express-session'),
	router     = express.Router(),
	// mailgunAPI = require('../config/mailgunAPI.js'),
	nodemailer = require('nodemailer'),
	middleware = require('./middleware.js'),
	User       = require('../models/user');
	
	
// session config - needed for passport
router.use(session({             // express-session config
    secret: 'cryptohfcftrader',
    resave: false,
    saveUninitialized: false
}));
router.use(flash());
	
// reset route root path
router.get('/', function(req, res) {
	// redirects to login page
	res.redirect('/restricted/reset/forgot');
});

// show the "Forgot my password" form
router.get('/forgot', function(req, res) {
	// render the page
	res.render('auth/forgot-password', { 
		user: req.user, 
		message: {
			error: req.flash('error'),
			success: req.flash('success'),
			info: req.flash('info')
		}
	});
});

// post route for "Forgot my password"
router.post('/forgot', function(req, res, next) {
	// waterfall method executes an array of callbacks sequentially, avoiding nested callbacks (callback hell)
	async.waterfall([
		// generates token
		function(done) {
			crypto.randomBytes(20, function(err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		// validates user from DB and saves token parameters
		function(token, done) {
			User.findOne({ 'local.email' :  req.body.email }, function(err, user) {
				// handle error
				if (err) {
					req.flash('error', err.message);
					return res.redirect('/restricted/reset/forgot');
				}
				// checks if there is a user with matching email
				if (!user) {
					req.flash('error', 'Não existe um usuário com o e-mail especificado.');
					return res.redirect('/restricted/reset/forgot');
				}
				
				// sets token parameters from user
				user.local.resetPasswordToken   = token;
				user.local.resetPasswordExpires = Date.now() + 1*60*60*1000; // 1 hour expiration for the generated token
				
				// saves updated user to database
				user.save(function(err) {
					done(err, token, user);
				});
			});
		},
		// mail reset link
		function(token, user, done) {
			var smtpTransport = nodemailer.createTransport({
				host: 'smtp.mailgun.org',
			    port: 587,
			    secure: false,
		        auth: {
			          user: 'postmaster@sandbox82c4eac79f1343d68f664a4c025dcc58.mailgun.org',
			          pass: '4dfc47de529aecf7baf0a53ebea0a082'
			        }
	        });
	        var mailOptions = {
				from: 'Suporte DNA Fork <yuriberezinalves@gmail.com>',
		        to: user.local.email,
		        subject: 'Redefinição de Senha',
		        text: 'Olá, ' + user.local.firstName + '\n\n' + 'Este e-mail foi enviado porque você (ou outra pessoa) solicitou a redefinição da senha de acesso para a sua conta.\n\n' +
		          'Por favor clique no link a seguir ou insira-o na barra de endereço do seu navegador para completar o processo:\n\n' +
		          'http://' + req.headers.host + '/restricted/reset/new/' + token + '\n\n' +
		          'Se você não solicitou a redefinição de senha, por favor ignore este e-mail e sua senha permanecerá inalterada.\n'
			};
	        smtpTransport.sendMail(mailOptions, function(err) {
		        if (err) {
	      			req.flash('error', err.message);
	      			return res.redirect('/restricted/reset/forgot');
	      		}
	      		req.flash('info', 'Um email com as instruções de redefinição de senha foi enviado para ' + user.local.email);
		        done(err, 'done');
	        });
	        
			// var mailData = {
			// 	from: 'Suporte DNA Fork <yuriberezinalves@gmail.com>',
		 //       to: user.local.email,
		 //       subject: 'Redefinição de Senha',
		 //       text: 'Olá, ' + user.local.firstName + '\n\n' + 'Este e-mail foi enviado porque você (ou outra pessoa) solicitou a redefinição da senha de acesso para a sua conta.\n\n' +
		 //         'Por favor clique no link a seguir ou insira-o na barra de endereço do seu navegador para completar o processo:\n\n' +
		 //         'http://' + req.headers.host + '/restricted/reset/new/' + token + '\n\n' +
		 //         'Se você não solicitou a redefinição de senha, por favor ignore este e-mail e sua senha permanecerá inalterada.\n'
			// };
	  //  	mailgunAPI.messages().send(mailData, function (err, body) {
	  //    		if (err) {
	  //    			req.flash('error', err.message);
	  //    			return res.redirect('/restricted/reset/forgot');
	  //    		}
	  //    		req.flash('info', 'Um email com as instruções de redefinição de senha foi enviado para ' + user.local.email);
	  //    		done(err, 'done');
	  //  	});
		}
	], function(err) {
	    if (err) return next(err);
	    res.redirect('/restricted/reset/forgot');
	});
});

// show the "Reset password" form
router.get('/new/:token', function(req, res) {
	
	User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
	    if (err) {
        	req.flash('error', err.message);
        	return res.redirect('/restricted/reset/forgot');
        }
        if (!user) {
        	req.flash('error', 'Token de redefinição de senha é inválido ou expirou. Por favor, reiniciar o procedimento.');
        	return res.redirect('/restricted/reset/forgot');
        }
        res.render('auth/new-password', { 
			user: user, 
			message: {
				error: req.flash('error'),
				success: req.flash('success'),
				info: req.flash('info')
			}
		});
  });
});

// post route for "Reset password"
router.post('/new/:token', function(req, res){
	async.waterfall([
        function(done) {
          User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
            if (err) {
            	req.flash('error', err.message);
            	return res.redirect('/restricted/reset/forgot');
            }
            if (!user) {
            	req.flash('error', 'Token de redefinição de senha é inválido ou expirou. Por favor, reiniciar o procedimento.');
            	return res.redirect('back');
            }
    		
    		// redefine password and reset token
            user.local.password = user.generateHash(req.body.password);
            user.local.resetPasswordToken = undefined;
            user.local.resetPasswordExpires = undefined;
    		
            user.save(function(err) {
                if (err) {
                	req.flash('error', err.message);
                	return res.redirect('/restricted/reset/forgot');
                }
                req.logIn(user, function(err) {
                    done(err, user);
                });
            });
          });
        },
        function(user, done) {
        	var smtpTransport = nodemailer.createTransport({
	        	host: 'smtp.mailgun.org',
			    port: 587,
			    secure: false,
		        auth: {
			          user: 'postmaster@sandbox82c4eac79f1343d68f664a4c025dcc58.mailgun.org',
			          pass: '4dfc47de529aecf7baf0a53ebea0a082'
			        }
	        });
	        var mailOptions = {
	          	from: 'Suporte DNA Fork <yuriberezinalves@gmail.com>',
	            to: user.local.email,
	            subject: 'Senha Redefinida com Sucesso',
	            text: 'Olá, ' + user.local.firstName + '\n\n' +
	              'Esta é uma confirmação de que a senha para sua conta ' + user.local.email + ' foi redefinida.\n'
	        };
	        smtpTransport.sendMail(mailOptions, function(err) {
		        if (err) {
	      			req.flash('error', err.message);
	      			return res.redirect('/restricted/reset/forgot');
	      		}
	      		req.flash('success', 'Sua senha foi redefinida com sucesso!');
		        done(err, 'done');
	        });
	        
          //var mailData = {
          //	from: 'Suporte HFCF <yuriberezinalves@gmail.com>',
          //  to: user.local.email,
          //  subject: 'Senha Redefinida com Sucesso',
          //  text: 'Olá, ' + user.local.firstName + '\n\n' +
          //    'Esta é uma confirmação de que a senha para sua conta ' + user.local.email + ' foi redefinida.\n'
          //};
          //mailgunAPI.messages().send(mailData, function (err, body) {
          //	if (err) {
          //		req.flash('error', err.message);
          //		return res.redirect('/restricted/reset/forgot');
          //	}
          //	req.flash('success', 'Sua senha foi redefinida com sucesso!');
          //	done(err, 'done');
          //});
        }
    ], function(err) {
    if(err) {
        req.flash('error', err.message);
      	return res.redirect('/restricted/reset/forgot');
    }
    res.redirect('/restricted/dashboard');
  });
});

module.exports = router;  
  
    