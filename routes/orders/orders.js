var mongoose = require('mongoose');
var Order = mongoose.model('Order');


//POST new order creation form
exports.create = function (req, res) {
	var orderId = 0;

	// Function to get the next order ID = #(existing orders) + 1
	function getNextOrderId(callback) {
		Order.count({}, function(error, count) {
			console.log('I have '+count+' documents in my collection');
			orderId = count + 1;
			callback();
		});
		
	}
	
	// Create an order matching the database schema
	/* For example, from Firefox POSTER addon, do this
	   URL = http://localhost:3000/orders/new
	   TYPE = POST
	   Data =
	   <data starts here>
	 	{
			"customerContact" : 7829455333, 
			"customerName" : "Anarv", 
			"vendorContact" : 918028450292, 
			"vendorName" : "PopularMedicals",
			"drugList": [
  				{"drugName":"Dolo", "strength":"650mg", "quantity":"15"},
  				{"drugName":"Saridon","strngth":"500mg","quantity":"30"}
			]
		}
	<data ends herer>
	 */
	function createOrder() {
	Order.create({
		orderId: orderId,
		customerContact: req.body.customerContact,
		customerName: req.body.customerName,
		portfolioName: 'default',
		vendorContact: req.body.vendorContact,
		vendorName: req.body.vendorName,
		drugList: req.body.drugList,
		startDate: Date.now(),
		endDate: Date.now() + 15*86400000,
		modifiedOn: Date.now(),
		status: 0
	}, function(err, user) {
		if(err) {
			console.log(err);
			res.redirect('/?error=true');
		}
		else {
			//SUCCESS
			res.writeHead(200, {'Content-Type': 'application/json'});
			res.write("{'orderId':'");
			res.write("" + orderId);
			res.end("'}");
			console.log("Order created and saved: " + user);
		}
	});
	}
	
	getNextOrderId(createOrder);
	console.log("Received the order : " + JSON.stringify(req.body));
	
};

// List my previous orders
// for example http://localhost:3000/orders/byuser?customerContact=9902455333
/* What you get back is of the format:
 [{"_id":"57382f8d0f8382e61b3df9c4",
 "orderId":3,
 "customerContact":7829455333,
 "customerName":"Anarv",
 "portfolioName":"default",
 "vendorContact":918028450292,
 "vendorName":"PopularMedicals",
 "status":0,
 "createdOn":"2016-05-15T08:13:01.471Z",
 "drugList":[
 	{"drugName":"Dolo","strength":"650mg","quantity":15,"_id":"57382f8d0f8382e61b3df9c6"},
 	{"drugName":"Saridon","quantity":30,"_id":"57382f8d0f8382e61b3df9c5"}]
 }]
 */

exports.byUser = function(req, res) {
		console.log("Getting user orders");
		console.log(req.query);
		console.log(JSON.stringify(req.query));
		if(req.query.customerContact) {
			Order.findByUserContact(
				req.params.customerContact,
				function (err, orderList) {
					if(!err) {
						console.log(orderList);
						res.json(orderList);
					} else {
						console.log(err);
						res.json({"status": "error", "error":"Error finding Orders"});
					}
				});
		} else {
			console.log("No user contact supplied");
			res.send({"status": "error", "error": "No user contact supplied"});
		}
	};
