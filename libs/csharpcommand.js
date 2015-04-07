var command = exports;

command.ProcessRequest = function (description) {
	var namespaces = "using System;\nusing System.Net.Http;\nusing System.Net.Http.Headers;\nusing System.Text;\nusing System.Threading.Tasks;\n\n";
	
	var documentation = "";
	if (typeof description.documentation !== "undefined") {
		documentation = '/*\nDocumentation:\n\tTitle: '+ (description.documentation.title || "") + '\n\tContent: '+ (description.documentation.content || "") + '\n\n*/\n';
	}

	var namespace = 'namespace rest.raml\n{\n';
	var classcomments = '\t/// <summary>\n\t/// '+description.title+' Client API\n\t/// Version:'+ (typeof description.version === "undefined" ? "" : description.version) +'\n\t/// </summary>\n'
	var classdeclaration = '\tpublic class Client : IDisposable\n\t{\n\t\treadonly HttpClient _client;\n\t\tpublic Client(string acceptHeader, string baseUri)\n\t\t{\n\t\t\t_client = new HttpClient();\n\t\t\t_client.BaseAddress = new System.Uri(baseUri);\n\t\t\t_client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(acceptHeader));\n\t\t}\n\n';

	var functions = '';
	if(typeof description.resources !== "undefined") { 
		for(var i = 0; i < description.resources.length; i++) {
			functions += GenerateFunctionClient(description.resources[i], description.resources[i]);
		}
	}

	var closingStatements = '\t\tbool disposed = false;\n\n\t\tprotected virtual void Dispose(bool disposing)\n\t\t{\n\t\t\tif(disposed) return;\n\n\t\t\tif (disposing)\n\t\t\t{\n\t\t\t\t_client.Dispose();\n\t\t\t}\n\n\t\t\tdisposed = true;\n\t\t}\n\n\t\tpublic void Dispose()\n\t\t{\n\t\t\tDispose(true);\n\t\t\tGC.SuppressFinalize(this);\n\t\t}\n\t}\n}'

  	return namespaces + documentation + namespace + classcomments + classdeclaration + functions + closingStatements;
};

function GenerateFunctionClient(resource, parentResource){
	var results = "";

	if(typeof resource.methods !== "undefined") { 
        for(var i = 0; i < resource.methods.length; i++) {

            results += GenerateFunction(resource.methods[i], parentResource);

            if(typeof resource.methods[i].resources !== "undefined") { 
	            for(var h = 0; h < resource.methods[i].resources.length; h++) {
	                results += GenerateFunctionClient(resource.methods[i].resources[h], resource);
	            }
	        }
        }
    }

	return results;
}

function GenerateFunction(method, parentResource){
	var functionComment = '\t\t/// <summary>\n\t\t/// '+parentResource.displayName+'\n\t\t/// Documentation: '+method.description+'\n\t\t/// </summary>\n';
    var uriParameters = "";
    if(typeof parentResource.uriParameters !== "undefined") { 
        for(var j in parentResource.uriParameters) { 
            uriParameters += ConvertTypeToCSharpType(parentResource.uriParameters[j].type) + ' '+ parentResource.uriParameters[j].displayName +',';
            functionComment += '\t\t/// <param name="'+parentResource.uriParameters[j].displayName+'">'+parentResource.uriParameters[j].description+'</param>\n';
        }
    }

	var queryParameters = "";
	if(typeof parentResource.queryParameters !== "undefined") { 
	    for(var j in parentResource.queryParameters) { 
	        queryParameters += ConvertTypeToCSharpType(parentResource.queryParameters[j].type) + ' '+ parentResource.queryParameters[j].displayName +',';
	        functionComment += '\t\t/// <param name="'+parentResource.queryParameters[j].displayName+'">'+parentResource.queryParameters[j].description+'</param>\n';
	    }
	}

	var putPostParam = '';
	if(method.method == 'put' || method.method == 'post') { 
		putPostParam = 'string body, string contentType';
		functionComment += '\t\t/// <param name="body">This is the body of the message.</param>\n'; 
		functionComment += '\t\t/// <param name="contentType">This is the type of data you are sending in the body.</param>\n';
	}
	functionComment += '\t\t/// <returns></returns>\n';
	
	return functionComment + GenerateFunctionBody(method, parentResource, uriParameters, queryParameters, putPostParam);	
}

function GenerateFunctionBody(method, parentResource, uriParameters, queryParameters, putPostParam){
	var parameters = uriParameters + queryParameters + putPostParam;
	parameters = parameters[parameters.length-1] == ',' ? parameters.substring(0, parameters.length-1) : parameters;
	var functionName = '\t\tpublic async Task<HttpResponseMessage> '+parentResource.displayName+'('+ parameters +')\n';
	functionName += '\t\t{\n';
	functionName += '\t\t\tvar relativeUri = "' + (parentResource.parentUrl || '') + parentResource.relativeUri + '";\n';
	
	if(parentResource.uriParameters){
		for(var x in parentResource.uriParameters){
			functionName += '\t\t\trelativeUri = relativeUri.Replace("{'+parentResource.uriParameters[x].displayName+'}", '+parentResource.uriParameters[x].displayName+'.ToString());\n';
		}
	}

	if(parentResource.queryParameters){
		functionName += 'relativeUri += relativeUri +"?";';
		for(var i in parentResource.queryParameters){
			functionName += '\t\t\trelativeUri += relativeUri + "&'+parentResource.queryParameters[i].displayName+'=" + '+parentResource.queryParameters[i].displayName+'.ToString();\n';
		}
	}

    if(method.method == 'put' || method.method == 'post'){
    	functionName += '\t\t\tvar stringContent = new StringContent(body, Encoding.UTF8, contentType);\n';
    }
    
    switch(method.method){
    	case 'get':
    		functionName += '\t\t\treturn await _client.GetAsync(relativeUri);\n';
    		break;
    	case 'put':
    		functionName += '\t\t\treturn await _client.PutAsync(relativeUri, stringContent);\n';
    		break;
    	case 'post':
    		functionName += '\t\t\treturn await _client.PostAsync(relativeUri, stringContent);\n';
    		break;
    	case 'delete':
    		functionName += '\t\t\treturn await _client.DeleteAsync(relativeUri);\n';
    		break;
    }

	functionName += '\t\t}\n\n';
	return functionName;
}

function ConvertTypeToCSharpType(type){
	switch(type){
		case 'integer':
			return 'long';
			break;
		case 'number':
			return 'decimal';
			break;
		case 'date':
			return 'DateTime'
			break;
		case 'boolean':
			return 'bool';
			break;
		default:
			return type;
			break;
	}
}