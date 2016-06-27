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

	/**
     Create an order matching the database schema  - DONE & TESTED
	 For example, from a post client
	   URL = http://localhost:3000/orders/new
	   TYPE = POST
	   Data =
	   <data starts here>
		 	{
				"customerContact" : "9902455333", 
				"vendorContact" : 918028450292, 
				"drugList": [
	  				{"drugName":"Dolo", "strength":"650mg", "quantity":"15"},
	  				{"drugName":"Saridon","strength":"500mg","quantity":"30"}
				]
			}
	<data ends here>
	 **/
	function createOrder(data, json) {
	Order.create(
			{
				orderId: orderId,
				customerContact: data.customerContact,
				vendorContact: data.vendorContact,
				drugList: data.drugList,
				createdOn: Date.now(),
				status: 0
			}, 
			function(err, orderData) {
				if(err) {
					console.log(err);
					res.redirect('/?error=true');
				}
				else {
					//SUCCESS
					console.log("Order created and saved: " + orderData);
					if (json) {
						res.json({'orderId': orderId});
					}
					else {
						res.writeHead(200, {'Content-Type' : 'text/html'});
						res.write('<html><head/><body>');
						res.write('<h1>Order Id : ' + orderId + '</h1>');
						res.end('</body>');
					}
				}
			});
		}
	
	getNextOrderId(createOrder, req.body, req.accepts('json'));
};


/**
 	Get Order by OrderId  - DONE & TESTED
 	Request: 
 	http://localhost:3000/orders/order/1
  
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
	console.log("Getting Order  OrderId = " + req.params.orderId);
	if(req.params.orderId) {
		Order.findByOrderId(
			req.params.orderId,
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

  List my previous orders  - DONE & TESTED
  	Request: http://localhost:3000/orders/customer/9902455333

	Response: 
	[
		{"_id":"5743240fa27be8f92844fde4","orderId":1,"status":0},
		{"_id":"57432479a27be8f92844fde7","orderId":2,"status":0}
	]
	
	Empty response : [] if there are not matching orders
	
	Ofcourse, you could then extract the orderId from the response and retrieve the order details using the /orders/order/:orderid API

*/
exports.byUser = function(req, res) {
	console.log("Getting Order  for customerContact = " + req.params.customerContact);
	if(req.params.customerContact) {
		Order.findByCustomerContact(
			req.params.customerContact,
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

/**

List Vendor/Customer [with Status] orders  - DONE & TESTED
	Request: http://localhost:3000/orders/customer/9902455333
	http://localhost:3000/orders/customer/9902455333/3
	http://localhost:3000/orders/vendor/918028450292
	http://localhost:3000/orders/vendor/918028450292/3

	Response: 
	[
		{"_id":"5743240fa27be8f92844fde4","orderId":1,"status":3},
		{"_id":"57432479a27be8f92844fde7","orderId":2,"status":3}
	]
	
	Empty response : [] if there are not matching orders
	
	Ofcourse, you could then extract the orderId from the response and retrieve the order details using the /orders/order/:orderid API

*/
exports.byContact = function(req, res) {
	console.log("Getting Orders  for customerContact = " + req.params.contact + ", by Status = "+ req.params.status);
	if (req.params.contact) {
		var contactType = "vendorContact";
		if (req.url.includes("customer")) {
			contactType = "customerContact";
		}
		console.log("Contact type is : " + contactType);
		var jsonParam;
		if(req.params.status !== null) {
			jsonParam = { 
					[contactType] : req.params.contact, 
					'status':req.params.status
					};
		} else {
			jsonParam = { 
					[contactType] : req.params.contact
					};
		}
		Order.findByStatus(
			jsonParam,
			function (err, orderList) {
				if(!err) {
					console.log("Order = " + JSON.stringify(orderList));
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
/**
**
	Update Order by OrderId  - DONE & TESTED
	Request: 
	http://localhost:3000/orders/update/1
	Post Data:
	 eg. { "status":"2"}

	Response

[{
	"_id":"5743240fa27be8f92844fde4",
	"orderId":1,
	"customerContact":9902455333,
	"vendorContact":8023452850,
	"status":0,
	"createdOn":"2016-05-23T15:38:55.803Z",
	"acceptedOrRejectedAt":"2016-06-06T14:37:39.579Z",
	"transitAt":"2016-06-06T14:37:49.426Z",
	"drugList":[
		{"drugName":"Crocin","strength":"250mg","quantity":15,"_id":"5743240fa27be8f92844fde6"},
		{"drugName":"Dolo","strength":"500mg","quantity":30,"_id":"5743240fa27be8f92844fde5"}
	]
}]

Empty response : [] if there are not matching orders
*/

exports.update = function (req, res) {
	
	Order.updateByOrderId({
		orderId: req.params.orderId,
		status: req.body.status,
		res: res
	}, 
	function(err, doc) {
		if(err) {
			console.log(err);
			res.redirect('/?error=true');
		}
		else {
			//SUCCESS
			if (req.accepts('json')) {
				res.json(doc);
			}
			else {
				res.writeHead(200, {'Content-Type' : 'text/html'});
				res.write('<html><head/><body>');
				res.write('<h1>Order Details : ' + JSON.stringify(doc) + '</h1>');
				res.end('</body>');
			}			
		}
	});
};
