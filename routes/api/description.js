var path = require('path');  
var fs = require('fs');
var raml = require('raml-parser');
var validUrl = require('valid-url');
var baseLocation = "";

module.exports = function (app, location) {
	baseLocation = location;
  	app.post('/api/descriptions', ConvertDescriptionToModel);
};

function ConvertDescriptionToModel(request, response){
	response.set('Content-Type', 'application/json');

	if(request.accepts('application/json'))
	{
		ConvertRAMLtoJson(request, response);
	}
	else{
		response.status(415).send("{\"Message\":\"The server only exceptions application/yaml+raml and returns application/json\"}")
		response.end();
	}
}

function ConvertRAMLtoJson(request, response){
	var ramlvalue = "";

	if( validUrl.is_uri(request.body) ){

		var r = require('request');
		r(request.body, function (error, res, body) {
		  if (!error && response.statusCode == 200) {
		    raml.load(body).then( function(data) {
				response.status(200).send(JSON.stringify(data))
				response.end();
			}, function(error) {
				response.status(422).send("{ \"Message\":\"Your Raml was ok, but could not be parsed\", \"Error\":"+JSON.stringify(error)+" }");
				response.end();
			});
		  }
		});
	}
	else{
		ramlvalue = request.body;
		raml.load(ramlvalue).then( function(data) {
			response.status(200).send(JSON.stringify(data))
			response.end();
		}, function(error) {
			response.status(422).send("{ \"Message\":\"Your Raml was ok, but could not be parsed\", \"Error\":"+JSON.stringify(error)+" }");
			response.end();
		});
	}
}