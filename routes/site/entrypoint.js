var path = require('path');  
var fs = require('fs');
var baseLocation = "";

module.exports = function (app, location) {
	baseLocation = location;
  	app.get('/', Index);
};

function Index(request, response){
	var file = fs.readFileSync(path.join(baseLocation, 'views/index.html'), 'utf8');
	response.status(200)
			.send(file);
	response.end();
}