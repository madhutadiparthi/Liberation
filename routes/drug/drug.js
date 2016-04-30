var mongoose = require('mongoose');
var drug = mongoose.model('Drug');

//GET user creation form
exports.create = function(req, res) {
	res.render('drug/drug-form', {
		title : 'Add Drug',
		buttonText: "Create!"
	});
};

//POST new user creation form
exports.doCreate = function (req, res) {
	drug.create({
		name: req.body.Name,
		companyName: req.body.CompanyName,
		strength: req.body.Strength,
		modifiedOn: Date.now()
	}, function(err, user) {
		if(err) {
			console.log(err);
			if(err.code===11000) {
				res.redirect('/drug/new?exists=true');
			} else {
				res.redirect('/?error=true');
			}
		}else {
			//SUCCESS
			console.log("Drug added successfully: " + user);
		}
	});
};
