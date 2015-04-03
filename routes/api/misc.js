var path = require('path');  
var fs = require('fs');
var raml = require('raml-parser');
var baseLocation = "";

module.exports = function (app, location) {
	baseLocation = location;
  	app.get('/api/postman', postman);
};

function postman(request, response){
	response.set('Content-Type', 'application/json');
	var file = fs.readFileSync(path.join(baseLocation, 'views/postman.json'), 'utf8');
	response.status(200)
			.send(file);
	response.end();
}