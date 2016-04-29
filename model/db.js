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

mongoose.connection.on('error', function() {
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
		Area: String,
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
	
	createdOn: {type: Date, default: Date.now},
	modifiedOn: Date
});

//Build the User Model
mongoose.model('Portfolio', portfolioSchema);

/***************************************************************
USER DRUG ORDER SCHEMA
****************************************************************/
var userDrugOrderSchema =  new mongoose.Schema({
	Orderid: String,
	portfolioName: String,
	drugName : String,
	qty: Number,
	vendorContact: { type: Number, 
		validate: {
			validator: function(v) {
				return /d{10}/.test(v);
			},
			message: '{VALUE} is not a valid 10 digit number!'
		}
	},
	startDate: Date, //default but modifiable
	endDate : Date, //automatically generated (startDate+quantity)
	createdOn: {type: Date, default: Date.now},
	modifiedOn: Date
});

//Build the User Model
mongoose.model('UserDrugOrder', userDrugOrderSchema);

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


//Build the Project Model
mongoose.model('Drug', drugSchema);

/*projectSchema.statics.findByUserID = function (userid, callback) {
	this.find(
	{ createdBy: userid },
	'_id projectName',
	{sort: 'modifiedOn'},
	callback);
}*/
