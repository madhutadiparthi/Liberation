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
				res.redirect('/project/new?exists=true');
			} else {
				res.redirect('/?error=true');
			}
		}else {
			//SUCCESS
			console.log("Drug added successfully: " + user);
		}
	});
};

exports.byUser = function(req, res) {
	console.log("Getting user projects");
	if(req.params.userid) {
		Project.findByUserID(
			req.params.userid,
			function (err, projects) {
				if(!err) {
					console.log(projects);
					res.json(projects);
				} else {
					console.log(err);
					res.json({"status": "error", "error":"Error finding projects"});
				}
			})
	} else {
		console.log("No user id supplied");
		res.join({"status": "error", "error": "No user id supplied"});
	}
};