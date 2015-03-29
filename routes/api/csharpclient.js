var path = require('path');  
var fs = require('fs');
var raml = require('raml-parser');

module.exports = function (app) {

  app.post('/api/clients', ConvertJsonToCsharp);
};

function ConvertJsonToCsharp(request, response){
	if(request.accepts('application/json'))
	{
		ConvertJsontoClient(request, response);
	}
	else{
		response.status(415).send("{'Message':'The server only exceptions application/json'}")
		response.end();
	}
}

function ConvertJsontoClient(request, response){
	var obj = '';
	try {
		var obj = JSON.parse(request.body);
	}
	catch(err){
		response.status(400).send("{'Message':'Could not parse the request.'}")
		response.end();
	}
	
	var description = obj.description;
	var languageType = obj.languageType;

	switch(languageType)
	{
		case 'C#':
			CreateCSharpClient(description, response);
			break;
		default:
			response.status(400).send("{'Message':'The server can only create clients of these types: "+ValidTypes()+". You selected: "+languageType+"'}")
			response.end();
			break;
	}
}

function ValidTypes(){
	return "C#";
}

function CreateCSharpClient(description, response){
	response.send("OK");
	response.end();
}