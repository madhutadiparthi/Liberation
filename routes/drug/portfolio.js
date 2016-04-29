var mongoose = require('mongoose');
var portfolio = mongoose.model('Portfolio');

//GET user creation form
exports.create = function(req, res) {
	if(req.session.loggedIn === true) {
		res.render('drug/portfolio-form', {
			title : 'Add Drug to the Portfolio',
			name: 'myportfolio',
			//contact: req.session.user.contact,
			buttonText: "Add!"
		});
	}else {
		res.redirect('/login');
	}
};

//POST new user creation form
exports.doCreate = function (req, res) {
	portfolio.create({
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
				res.redirect('/portfolio/new?exists=true');
			} else {
				res.redirect('/?error=true');
			}
		}else {
			//SUCCESS
			console.log("Drug added to the Portfolio: " + user);
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