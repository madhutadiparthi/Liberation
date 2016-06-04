var mongoose = require('mongoose');
var prescription = mongoose.model('Prescription');

//GET user creation form
exports.create = function(req, res) {
	if(req.session.loggedIn === true) {
		res.render('drug/prescription-form', {
			title : 'Add Drug to the Prescription',
			name: 'myprescription',
			//contact: req.session.user.contact,
			buttonText: "Add!"
		});
	}else {
		res.redirect('/login');
	}
};

//POST new user creation form
exports.doCreate = function (req, res) {
	prescription.create({
		name: req.body.name,
		contact: req.session.user.contact,
		drugName: req.body.DrugName,
		strength: req.body.Strength,
		drugInfo: [{strength: req.body.Strength,
			morning: req.body.Morning,
			afternoon: req.body.Afternoon,
			night: req.body.Night
		}],
		modifiedOn: Date.now()
	}, function(err, user) {
		if(err) {
			console.log(err);
			if(err.code===11000) {
				res.redirect('/prescription/new?exists=true');
			} else {
				res.redirect('/?error=true');
			}
		}else {
			//SUCCESS
			console.log("Drug added to the prescription: " + user);
		}
	});
};

exports.byUser = function(req, res) {
	console.log("Getting user prescriptions");
	if(req.params.contact) {
		prescription.findByUserContact(
			req.params.contact,
			function (err, prescriptions) {
				if(!err) {
					console.log(prescriptions);
					res.json(prescriptions);
				} else {
					console.log(err);
					res.json({"status": "error", "error":"Error finding prescriptions"});
				}
			});
	} else {
		console.log("No user contact supplied");
		res.join({"status": "error", "error": "No user contact supplied"});
	}
};