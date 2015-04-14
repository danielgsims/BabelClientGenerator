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

            results += GenerateFunction(resource.methods[i], resource);

            if(typeof resource.methods[i].resources !== "undefined") { 
	            for(var h = 0; h < resource.methods[i].resources.length; h++) {
	                results += GenerateFunctionClient(resource.methods[i].resources[h], resource);
	            }
	        }
        }
    }

    if(typeof resource.resources !== "undefined") { 
        for(var h = 0; h < resource.resources.length; h++) {
            results += GenerateFunctionClient(resource.resources[h], resource);
        }
    }

	return results;
}

function GenerateFunction(method, resource){
	var functionComment = '\t\t/// <summary>\n\t\t/// '+method.method+resource.uniqueId+'\n\t\t/// Documentation: '+method.description+'\n\t\t/// </summary>\n';
    var uriParameters = "";
    if(typeof resource.uriParameters !== "undefined") { 
        for(var j in resource.uriParameters) { 
            uriParameters += ConvertTypeToCSharpType(resource.uriParameters[j].type) + ' '+ resource.uriParameters[j].displayName +',';
            functionComment += '\t\t/// <param name="'+resource.uriParameters[j].displayName+'">'+resource.uriParameters[j].description+'</param>\n';
        }
    }

	var queryParameters = "";
	if(typeof resource.queryParameters !== "undefined") { 
	    for(var j in resource.queryParameters) { 
	        queryParameters += ConvertTypeToCSharpType(resource.queryParameters[j].type) + ' '+ resource.queryParameters[j].displayName +',';
	        functionComment += '\t\t/// <param name="'+resource.queryParameters[j].displayName+'">'+resource.queryParameters[j].description+'</param>\n';
	    }
	}

	var putPostParam = '';
	if(method.method == 'put' || method.method == 'post') { 
		putPostParam = 'string body, string contentType';
		functionComment += '\t\t/// <param name="body">This is the body of the message.</param>\n'; 
		functionComment += '\t\t/// <param name="contentType">This is the type of data you are sending in the body.</param>\n';
	}
	functionComment += '\t\t/// <returns></returns>\n';
	
	return functionComment + GenerateFunctionBody(method, resource, uriParameters, queryParameters, putPostParam);	
}

function GenerateFunctionBody(method, resource, uriParameters, queryParameters, putPostParam){
	var parameters = uriParameters + queryParameters + putPostParam;
	parameters = parameters[parameters.length-1] == ',' ? parameters.substring(0, parameters.length-1) : parameters;
	var functionName = '\t\tpublic async Task<HttpResponseMessage> '+method.method+resource.uniqueId+'('+ parameters +')\n';
	functionName += '\t\t{\n';
	functionName += '\t\t\tvar relativeUri = "' + (resource.parentUrl || '') + resource.relativeUri + '";\n';
	
	if(resource.uriParameters){
		for(var x in resource.uriParameters){
			functionName += '\t\t\trelativeUri = relativeUri.Replace("{'+resource.uriParameters[x].displayName+'}", '+resource.uriParameters[x].displayName+'.ToString());\n';
		}
	}

	if(resource.queryParameters){
		functionName += 'relativeUri += relativeUri +"?";';
		for(var i in resource.queryParameters){
			functionName += '\t\t\trelativeUri += relativeUri + "&'+resource.queryParameters[i].displayName+'=" + '+resource.queryParameters[i].displayName+'.ToString();\n';
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