var path = require('path');  
var fs = require('fs');
var raml = require('raml-parser');
var baseLocation = "";

module.exports = function (app, location) {
	baseLocation = location;
  	app.post('/api/descriptions', ConvertDescriptionToModel);
};

function ConvertDescriptionToModel(request, response){
	response.set('Content-Type', 'application/json');

	if(request.accepts('application/yaml+raml'))
	{
		ConvertRAMLtoJson(request, response);
	}
	else{
		response.status(415).send("{\"Message\":\"The server only exceptions application/yaml+raml\"}")
		response.end();
	}
}

function ConvertRAMLtoJson(request, response){
	raml.load(request.body).then( function(data) {
		response.status(200).send(JSON.stringify(data))
		response.end();
	}, function(error) {
		response.status(422).send("{ \"Message\":\"Your Raml was ok, but could not be parsed\", \"Error\":"+JSON.stringify(error)+" }");
		response.end();
	});
}