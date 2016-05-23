var mongoose = require('mongoose');
var Order = mongoose.model('Order');


//POST new order creation form
exports.create = function (req, res) {
	var orderId = 0;

	// Function to get the next order ID = #(existing orders) + 1
	function getNextOrderId(callback, data, format) {
		Order.count({}, function(error, count) {
			console.log('I have '+count+' documents in my collection');
			orderId = count + 1;
			callback(data, format);
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
	<data ends here>
	 */
	function createOrder(data, json) {
	Order.create({
		orderId: orderId,
		customerContact: data.customerContact,
		vendorContact: data.vendorContact,
		drugList: data.drugList,
		createdOn: Date.now(),
		status: 0
	}, function(err, orderData) {
		if(err) {
			console.log(err);
			res.redirect('/?error=true');
		}
		else {
			//SUCCESS
			if (json) {
				res.writeHead(200, {'Content-Type': 'application/json'});
				res.write("{'orderId':'");
				res.write("" + orderId);
				res.end("'}");
			}
			else {
				res.writeHead(200, {'Content-Type' : 'text/html'});
				res.write('<html><head/><body>');
				res.write('<h1>Order Id : ' + orderId + '</h1>');
				res.end('</body>');
			}
			console.log("Order created and saved: " + orderData);
		}
	});
	}
	
	getNextOrderId(createOrder, req.body, req.accepts('json'));
};


/*
 * A typical URL would be of the format
 * http://localhost:3000/orders/byorderid?orderId=1
 * Returned data example:
 * [{"_id":"57382e59cc900ccf1b936a13",
 * "orderId":1,
 * "customerContact":7829455333,
 * "customerName":"Anarv",
 * "portfolioName":"default",
 * "vendorContact":918028450292,
 * "vendorName":"PopularMedicals",
 * "status":0,
 * "createdOn":"2016-05-15T08:07:53.545Z",
 * "drugList":[
 * 		{"drugName":"Dolo","strength":"650mg","quantity":15,"_id":"57382e59cc900ccf1b936a15"},
 * 		{"drugName":"Saridon","quantity":30,"_id":"57382e59cc900ccf1b936a14"}
 * 	]
 * }]
 */
exports.byOrderId = function(req, res) {
	console.log("Getting Order  OrderId = " + req.query.orderId);
	if(req.query.orderId) {
		Order.findByOrderId(
			req.query.orderId,
			function (err, order) {
				if(!err) {
					console.log("Order = " + order);
					if (req.accepts('json')) {
						console.log("Accepting JSON...");
						res.json(order);
					}
					else {
						var orderJSONString = JSON.stringify(order);
						var orderJSON = JSON.parse(orderJSONString);
						console.log('OrderId:---> ' + orderJSON[0].orderId);
						res.render('orders/order-page', {rows : orderJSON});
					}
				} else {
					console.log("Error: " + err);
					res.json({"status": "error", "error":"Error finding Orders"});
				}
			});
	} else {
		console.log("No order ID supplied");
		res.send({"status": "error", "error": "No orderId supplied"});
	}
};

//List my previous orders
//for example http://localhost:3000/orders/byuser?customerContact=9902455333
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
	console.log("Getting Order  for customerContact = " + req.query.customerContact);
	if(req.query.customerContact) {
		Order.findByCustomerContact(
			req.query.customerContact,
			function (err, orderList) {
				if(!err) {
					console.log("Order = " + orderList);
					if (req.accepts('json')) {
						console.log("Accepting JSON...");
						res.json(orderList);
					}
					else {
						var orderJSONString = JSON.stringify(orderList);
						var orderJSON = JSON.parse(orderJSONString);
						res.render('orders/order-page', {rows : orderJSON});
					}
				} else {
					console.log("Error: " + err);
					res.json({"status": "error", "error":"Error finding Orders"});
				}
			});
	} else {
		console.log("No order ID supplied");
		res.send({"status": "error", "error": "No user contact supplied"});
	}
};
