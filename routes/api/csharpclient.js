var path = require('path');
var fs = require('fs');
var location = "";

module.exports = function (app, baseLocation) {
	location = baseLocation;
  	app.post('/api/clients', ConvertJsonToCsharp);
};

function ConvertJsonToCsharp(request, response){
	response.set('Content-Type', 'text/plain');
	if(request.accepts('text/plain'))
	{
		ConvertJsontoClient(request, response);
	}
	else{
		response.status(415).send("{'Message':'The server only exceptions application/json'}");
		response.end();
	}
}

function ConvertJsontoClient(request, response){
	var obj = '';
	try {
		var obj = JSON.parse(request.body);
	}
	catch(err){
		response.status(400).send("{'Message':'Could not parse the request.'}");
		response.end();
	}

	var description = obj.description;
	var languageType = obj.languageType;

	switch(languageType)
	{
		case 'C#':
			CreateCSharpClient(description, location, response);
			break;
		case 'PHP':
			CreatePHPClient(description, location, response);
			break;
		default:
			response.status(400).send("{\"Message\":\"The server can only create clients of these types: "+ValidTypes()+". You selected: "+languageType+"\"}");
			response.end();
			break;
	}
}

function ValidTypes(){
	return "C#";
}

function CreateCSharpClient(description, partial, response){

  	var csharpCommand = require(path.join(location, 'libs/csharpcommand.js'));
	var result = csharpCommand.ProcessRequest(description);
	response.status(200).send(result);
	response.end();
}

function CreatePHPClient(description, partial, response){

  	var csharpCommand = require(path.join(location, 'libs/phpcommand.js'));
	var result = csharpCommand.ProcessRequest(description);
	response.status(200).send(result);
	response.end();
}