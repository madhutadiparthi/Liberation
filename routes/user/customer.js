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

/**
   URL: https://localhost:3000/users/update/9902455333
   Headers : Content-Type: application/json   &&   Accept: application/json
   Post Data: 
       MIME-Type : application/json
       
       { "name" : "Ashish K Mathur", 
       "contact" : 9902455333, 
       "email" : "reachashishmathur@gmail.com",
       "prefVendCont": 918028450292 
       }

 */
exports.udpate = function (req, res) {
	console.log('customerJS, update: ' + req.params.contact);
	console.log('customerJS, update: Document = ' + JSON.stringify(req.body));
	// TODO Validate data sent for missing data. Hate to update the database with bad data if what was sent was bad
	// If the contact sent was either incorrect(we didn't find the user in our database), bad format (not a number) or empty, 
	//    then we have to make sure we do the right thing. Either we can make sure the client sends all the data properly 
	//    and in proper format OR fix it here if something is bad.
	// For now, I have updated the method doc to show a sample that will work, assuming the contact is there in the database
	// Need to take care of the following
	//   0. Validate all data and report errors back before calling the DB methods. Need to have default acceptable values.
	//   1. What if we don't find the contact in the database, we should create it
	//   2. What if the phone numbers are not really numbers, then we need to report and error with expected format
	//   3. What if data is missing from the body that was sent, we dont want to put 'undefined' in the database. We should check.
	//   4. What format should we pass the data from the client to the server? For now I am setting it to now()
	Customer.update({
		contact: req.params.contact,
		name: req.body.name,
		email: req.body.email,
		address :  req.body.address,
		prefVendCont: req.body.prefVendCont,
		modifiedOn: Date.now(),
		lastLogin: Date.now()
	}, 
	function(err, doc) {
		if(err) {
			console.log(err);
			res.redirect('/?error=true');
		}
		else {
			//SUCCESS
			if (req.accepts('json')) {
				console.log("Success");
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