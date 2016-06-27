var mongoose = require('mongoose');
var Vendor = mongoose.model('Vendor');

/**
 * Create a Vendor matching the database schema - DONE & TESTED 
 For example, from a post client URL = http://localhost:3000/customer/new T
 YPE = POST Data =
 <data starts here> 
 	{
 		"name":"Madhu medicals", 
 		"contact": 1234567890,
		"email":"madhumedicals@gmail.com" 
	} 
	<data ends here>
 Return:
 	- Success: JSON representation of the vendor
 	- Failure:
 		- Vendor already exists
 		- bad contact provided (its not a number)
 		- 
 */
exports.create = function(req, res) {
	console.log("contact is : " + req.body.contact);
	console.log("Name is : " + req.body.name);
	console.log("email is : " + req.body.email);
	var address = req.body.address != null ? req.body.address : "";
	
	function registerVendor() {
		console.log("Address is :" + address );
		Vendor.create({
			name : req.body.name,
			contact : req.body.contact,
			email : req.body.email,
			address : address,
			modifiedOn : Date.now(),
			lastLogin : Date.now()
		}, function(err, user) {
			if (err) {
				// An error in creating a customer
				if (req.accepts('json')) {
					res.writeHead(501, {'Content-Type' : 'application/json'});
					res.end(JSON.stringify({"code" : 501, "message" : "Failed to register vendor", "contact" : req.body.contact}));
				} else {
					// TODO Use res.render
					res.writeHead(501, {'Content-Type' : 'text/html'});
					res.write('<html><head/><body>');
					res.write('Error registering vendor: ' + req.body.contact);
					res.end('</body>');
				}
				console.log("Vendor created and saved: " + err);

			} else {
				// Let them know it was successfully created
				if (req.accepts('json')) {
					res.writeHead(200, {
						'Content-Type' : 'application/json'
					});
					res.end(JSON.stringify({
						"code" : 200,
						"message" : "Vendor created successfully!",
						"contact" : user.contact
					}));
				} else {
					res.writeHead(200, {
						'Content-Type' : 'text/html'
					});
					res.write('<html><head/><body>');
					res.write(JSON.stringify(user));
					res.end('</body>');
				}
				console.log("Vendor created and saved: " + user);
			}
		});
	}

	function createIfNotExists(registerVendor) {
		Vendor.findByContact(req.body.contact, function(err, user) {
			if (err || user === null || user.length === 0) {
				// Register a new customer
				registerVendor();
			} else {
				// report that the user already exists
				// Its much cleaner this way
				res.writeHead(200, {
					'Content-Type' : 'application/json'
				});
				res.end(JSON.stringify({
					"code" : 200,
					"message" : "Customer is already registered: ",
					"contact" : user.contact
				}));

			}
		});
	}

	createIfNotExists(registerVendor);
};

/**
 * Get the vendor profile - Done & Tested
 URL: https://localhost:3000/vednor/9902455333 
 Headers : 
 	Content-Type: application/json && 
 	Accept: application/json 
 	}
 Return: vendor record
 */

exports.profile = function(req, res) {
	console.log("Getting vednor profile using  contact = " + req.params.contact);
	if (req.params.contact) {
		Vendor.findByContact(req.params.contact, function(err, profile) {
			if (!err) {
				
				if (profile === null) {
					res.json({"status":"failed", "Message":"Failed to find a vendor with contact = " + req.params.contact});
				}
 				else {
					console.log("vendor profile = " + profile);
					if (req.accepts('json')) {
						console.log("Accepting JSON...");
						res.json(profile);
					} else {
						var profileJSONString = JSON.stringify(profile);
						var profileJSON = JSON.parse(profileJSONString);
						console.log('Contact:---> ' + profileJSON[0].contact);
						res.render('user/prifile', {
							rows : profileJSON
						});
					}
 				}
			} else {
				console.log("Error: " + err);
				res.json({
					"status" : "error",
					"error" : "Error finding Vendor with contact: " + req.params.contact
				});
			}
		});
	} else {
		console.log("No vendor contact supplied");
		res.json({
			"status" : "error",
			"error" : "No contact supplied"
		});
	}
};

/**
 * Updates the customer profile - Done & Tested
 URL: https://localhost:3000/vendor/update/9902455333 
 Headers : 
 	Content-Type: application/json && 
 	Accept: application/json 
 Post Data: 
 	MIME-Type :  application/json
 		{ 
 		"name" : "Ashish K Mathur", 
 		"contact" : 9902455333, 
 		"email" : "reachashishmathur@gmail.com", 
 		"address": "#123, Varthu rRoad" 
 	}
 Return: updated customer record
 */
exports.udpate = function(req, res) {
	console.log('vendor, update: ' + req.params.contact);
	console.log('vendor, update: Document = ' + JSON.stringify(req.body));
	// TODO Validate data sent for missing data. Hate to update the database
	// with bad data if what was sent was bad
	// If the contact sent was either incorrect(we didn't find the user in our
	// database), bad format (not a number) or empty,
	// then we have to make sure we do the right thing. Either we can make sure
	// the client sends all the data properly
	// and in proper format OR fix it here if something is bad.
	// For now, I have updated the method doc to show a sample that will work,
	// assuming the contact is there in the database
	// Need to take care of the following
	// 0. Validate all data and report errors back before calling the DB
	// methods. Need to have default acceptable values.
	// 1. What if we don't find the contact in the database, we should create it
	// 2. What if the phone numbers are not really numbers, then we need to
	// report and error with expected format
	// 3. What if data is missing from the body that was sent, we dont want to
	// put 'undefined' in the database. We should check.
	// 4. What format should we pass the data from the client to the server? For
	// now I am setting it to now()
	Vendor.update({
		contact : req.params.contact,
		name : req.body.name,
		email : req.body.email,
		address : req.body.address,
		modifiedOn : Date.now(),
		lastLogin : Date.now()
	}, function(err, doc) {
		if (err) {
			console.log(err);
			res.redirect('/?error=true');
		} else {
			// SUCCESS
			if (req.accepts('json')) {
				console.log("Success");
				res.writeHead(200, {
					'Content-Type' : 'application/json'
				});
				res.write(JSON.stringify(doc));
				res.end("'}");
			} else {
				res.writeHead(200, {
					'Content-Type' : 'text/html'
				});
				res.write('<html><head/><body>');
				res.write('<h1>Customer Details : ' + JSON.stringify(doc)
						+ '</h1>');
				res.end('</body>');
			}
		}
	});
};