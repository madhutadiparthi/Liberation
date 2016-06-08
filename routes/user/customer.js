var mongoose = require('mongoose');
var Customer = mongoose.model('Customer');

//GET Customer creation form
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

//GET Customer creation form
exports.create = function(req, res) {
	res.render('user/user-form', {
		title : 'Create user',
		buttonText: "Join!"
	});
};

//POST new Customer creation form
exports.doCreate = function (req, res) {
	Customer.create({
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
		Customer.findOne (
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

exports.profile = function (req, res) {
	console.log("Getting customer profile using  contact = " + req.params.contact);
	if(req.params.contact) {
		Customer.findByContact(
			req.params.contact,
			function (err, profile) {
				if(!err) {
					console.log("customer profile = " + profile);
					if (req.accepts('json')) {
						console.log("Accepting JSON...");
						res.json(profile);
					}
					else {
						var profileJSONString = JSON.stringify(profile);
						var profileJSON = JSON.parse(profileJSONString);
						console.log('Contact:---> ' + profileJSON[0].contact);
						res.render('user/prifile', {rows : profileJSON});
					}
				} else {
					console.log("Error: " + err);
					res.json({"status": "error", "error":"Error finding Orders"});
				}
			});
	} else {
		console.log("No user contact supplied");
		res.send({"status": "error", "error": "No contact supplied"});
	}
};

exports.udpate = function (data, res) {
	console.log('customerJS, update: ' + data.contact);
	Customer.update({
		name: data.name,
		contact: data.contact,
		email: data.email,
		address :  data.address,
		prefVendCont: data.prefVendCont,
		modifiedOn: data.modifiedOn,
		lastLogin: data.lastLogin
	}, 
	function(err, doc) {
		if(err) {
			console.log(err);
			res.redirect('/?error=true');
		}
		else {
			//SUCCESS
			if (req.accepts('json')) {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.write(JSON.stringify(doc));
				res.end("'}");
			}
			else {
				res.writeHead(200, {'Content-Type' : 'text/html'});
				res.write('<html><head/><body>');
				res.write('<h1>Customer Details : ' + JSON.stringify(doc) + '</h1>');
				res.end('</body>');
			}			
		}
	});
};