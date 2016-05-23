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
			"customerContact" : "9902455333", 
			"vendorContact" : 918028450292, 
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


/**
 	Request: 
 	http://localhost:3000/orders/byorderid?orderId=1
  
 	Response

	[{
		"_id":"5743240fa27be8f92844fde4",
		"orderId":1,
		"customerContact":9902455333,
		"vendorContact":8023452850,
		"status":0,
		"createdOn":"2016-05-23T15:38:55.803Z",
		"drugList":[
			{"drugName":"Crocin","strength":"250mg","quantity":15,"_id":"5743240fa27be8f92844fde6"},
			{"drugName":"Dolo","strength":"500mg","quantity":30,"_id":"5743240fa27be8f92844fde5"}
		]
	}]
	
	Empty response : [] if there are not matching orders
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

/**

  List my previous orders
  	Request: http://localhost:3000/orders/byuser?customerContact=9902455333

	Response: 
	[
		{"_id":"5743240fa27be8f92844fde4","orderId":1,"status":0},
		{"_id":"57432479a27be8f92844fde7","orderId":2,"status":0}
	]
	
	Empty response : [] if there are not matching orders
	
	Ofcourse, you could then extract the orderId from the response and retrieve the order details using the /byorderid API

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
