var path = require('path');  
var ejs = require('ejs');
var fs = require('fs');
var raml = require('raml-parser');
var csTemplate = null;
var location = "";

module.exports = function (app, baseLocation) {
	location = baseLocation;
  	app.post('/api/clients', ConvertJsonToCsharp);

  	var csharpPath = path.join(baseLocation, 'views/csharp.ejs');
  	var csharpFile = fs.readFileSync(csharpPath, 'utf8');
	var partial = path.join(location, 'views/csharpFunction.ejs');
  	
  	csTemplate = ejs.compile(csharpFile, { 'filename':partial });
};

function ConvertJsonToCsharp(request, response){
	response.set('Content-Type', 'text/plain');
	if(request.accepts('text/plain'))
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
	var partial = path.join(location, 'views/csharpFunction.ejs');

	switch(languageType)
	{
		case 'C#':
			CreateCSharpClient(description, partial, response);
			break;
		default:
			response.status(400).send("{\"Message\":\"The server can only create clients of these types: "+ValidTypes()+". You selected: "+languageType+"\"}")
			response.end();
			break;
	}
}

function ValidTypes(){
	return "C#";
}

function CreateCSharpClient(description, partial, response){
	description.partialPath = partial;
	var result = csTemplate(description);
	result = result.split('\n<').join('<');
	result = result.split('\r\n<').join('<');
	response.status(200).send(result);
	response.end();
}