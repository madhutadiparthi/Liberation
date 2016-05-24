 /*   
	* We required Mongoose
    * We set the connection string for the MongoDB database
    * We defined the User schema
    * We built the User model
    * We defined the Medicines schema
    * We built the Medicines model
    * We opened the Mongoose connection to the database
    */

var mongoose = require('mongoose'),
dbURI = 'mongodb://localhost/LiberationPM';
mongoose.connect(dbURI);

mongoose.connection.on('connected', function() {
	console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function(err) {
	console.log('Mongoose connection error: ' + err);
});

//Take care of reconnecting back when it is discoonected
//unintentionally
mongoose.connection.on('disconnected', function() {
	console.log('Mongoose disconnected');
});

mongoose.connection.on('SIGINT', function() {
	mongoose.connection.close(function() {
		console.log('Mongoose disconnected through app termination');
		process.exit(0);
	});
});

//connection events snipped out for brevity

/***************************************************************
USER SCHEMA
****************************************************************/
var userSchema =  new mongoose.Schema({
	name: String,
	contact: Number,
	/*contact: { type: Number, 
				validate: {
					validator: function(v) {
						return /d{10}/.test(v);
					},
					message: '{VALUE} is not a valid 10 digit number!'
				}
			},*/
	email: {type: String, unique:true},
	dob: Date,
	age: Number,
	gender: String,
	address: {houseNum: String,
		buildingName: String,
		street: String,
		area: String,
		city: String,
		state: String,
		pincode: Number
		/*pincode: { type: Number, 
			validate: {
				validator: function(v) {
					return /d{6}/.test(v);
				},
				message: '{VALUE} is not a valid 6 digit number!'
			}
		}*/
	},
	createdOn: {type: Date, default: Date.now},
	modifiedOn: Date,
	lastLogin: Date
});

//Build the User Model
mongoose.model('User', userSchema);

/***************************************************************
USER DRUG PORTFOLIO SCHEMA
****************************************************************/
var portfolioSchema =  new mongoose.Schema({
	name: String,
	contact: Number,
	/*contact: { type: Number, 
				validate: {
					validator: function(v) {
						return /d{10}/.test(v);
					},
					message: '{VALUE} is not a valid 10 digit number!'
				}
			},*/
	drugName : String,
	drugInfo : [ {strength: String,
                  dosage: Number,
                  morning: Boolean,
				  afternoon: Boolean,
				  night: Boolean}],
	inorout : Boolean,
	createdOn: {type: Date, default: Date.now},
	modifiedOn: Date
});

portfolioSchema.statics.findByUserContact = function (userContact, callback) {
	this.find(
	{ contact: userContact },
	'_id name',
	{sort: 'modifiedOn'},
	callback);
};

//Build the User Model
mongoose.model('Portfolio', portfolioSchema);

/***************************************************************
USER DRUG ORDER SCHEMA
****************************************************************/
var orderSchema =  new mongoose.Schema({
	orderId: Number,
	customerContact: Number,
	vendorContact: Number,
	drugList: [{
		drugName: String,
		strength: String,
		quantity: Number,
	}],
	createdOn: {type: Date, default: Date.now},
	acceptedOrRejectedAt: Date,
	transitAt: Date,
	deiveredAt: Date,
	status: Number // Enum: 0 = new, 1 = accepted, 2 = transit, 3 = delivered, -1 = rejected
});

//Find user orders to show on 'My Orders' screen
orderSchema.statics.findByCustomerContact = function (customerContact, callback) {
	this.find(
	{ customerContact: customerContact },
	'orderId status',
	{sort: 'orderId'},
	callback);
};

//Find user orders - to show on an order detail screen for a customer or a vendor
orderSchema.statics.findByOrderId = function (orderId, callback) {
	this.find(
	{ orderId: orderId },
	'orderId status customerContact vendorContact createdOn drugList',
	{sort: 'orderId'},
	callback);
};


//Build the User Model
mongoose.model('Order', orderSchema);

/***************************************************************
DRUG SCHEMA
****************************************************************/
var drugSchema = new mongoose.Schema({
	name: String,
	createdOn: {type: Date, default: Date.now},
	modifiedOn: Date,
	companyName: String,
	composition: [String],
	strength: String
});


//Build the Drug Model
mongoose.model('Drug', drugSchema);

/*****************************************************************
 * VENDOR SCHEMA
 *****************************************************************/
var vendorSchema = new mongoose.Schema({
	name: String,
	shopName: String,
	contact : [Number],
	addrress: {shopNum: String,
		buildingName: String,
		street: String,
		area: String,
		city: String,
		state: String,
		pincode: Number 
		},
	regId: String,
	createdOn: {type: Date, default: Date.now},
	modifiedOn: Date,
	lastLogin: Date
	
});

//Build the Vendor model
mongoose.model('Vendor', vendorSchema);
/*****************************************************************
 * ORDER QUEUE SCHEMA
 *****************************************************************/
var orderQueueSchema = new mongoose.Schema({
	queue: [{orderId : Number}]
});
