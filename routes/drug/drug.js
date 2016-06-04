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
	var data = req.body;
	console.log(data);
	
	function addDrug(callback, data) {
		var obj = JSON.parse(Object.keys(data));
		callback(obj);
	}
	
	function createDrug(data, json) {
		console.log("name: " + data.name);
		drug.create({
			name: data.name,
			strength: data.strength,
			type: data.type,
			companyName: data.company,
			genericName: data.genericName,
			modifiedOn: Date.now()
		}, function(err, drugData) {
			if(err) {
				console.log(err);
				res.redirect('/?error=true');
			}
			else {
				//SUCCESS
				if (json) {
					res.writeHead(200, {'Content-Type': 'application/json'});
					res.write("Drug created");
					res.end();
				}
				else {
					res.writeHead(200, {'Content-Type' : 'text/html'});
					res.write('<html><head/><body>');
					res.write('Drug Created');
					res.end('</body>');
				}
				console.log("Drug created and saved: " + drugData);
			}
		});
		}
		
		addDrug(createDrug, data, req.accepts('json'));
};
