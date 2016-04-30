var mongoose = require('mongoose');
var User = mongoose.model('User');

//GET user creation form
exports.index = function(req, res) {
	if(req.session.loggedIn === true) {
		res.render('user/user-page', {
			title: req.session.user.name,
			name: req.session.user.name,
			contact: req.session.user.contact,
			email: req.session.user.email,
			userID: req.session.user._id
		});
	} else {
		res.redirect('/login');
	}
};

//GET user creation form
exports.create = function(req, res) {
	res.render('user/user-form', {
		title : 'Create user',
		buttonText: "Join!"
	});
};

//POST new user creation form
exports.doCreate = function (req, res) {
	User.create({
		name: req.body.FullName,
		contact: req.body.Contact,
		email: req.body.Email,
		modifiedOn: Date.now(),
		lastLogin: Date.now()
	}, function(err, user) {
		if(err) {
			console.log(err);
			if(err.code===11000) {
				res.redirect('/user/new?exists=true');
			} else {
				res.redirect('/?error=true');
			}
		}else {
			//SUCCESS
			console.log("User created and saved: " + user);
		}
	});
};

exports.login = function (req, res) {
	res.render('user/login-form', {
		title: 'Log in' 
	});
};

exports.doLogin = function (req, res) {
	if(req.body.Contact) {
		User.findOne (
			{'contact': req.body.Contact},
			'_id name email contact',
			function(err, user) {
				if(!err) {
					if(!user) {
						res.redirect('/login?404=user');
					} else {
						req.session.user = {
							"name" : user.name,
							"contact":user.contact,
							"email": user.email,
							"_id": user._id
						};
						req.session.loggedIn = true;
						console.log('Logged in user: ' + user);
						res.redirect('/user');
					}
				} else {
					res.redirect('/login?404=error');
				}
			});
	} else {
		res.redirect('/login?404=error');
	}
};

exports.createUser = function (req, res) {
	User.create({
		name: req.body.FullName,
		contact: req.body.Contact,
		email: req.body.Email,
		modifiedOn: Date.now(),
		lastLogin: Date.now()

};