var command = exports;

command.ProcessRequest = function (description) {
	var phpFile = "<?php\n"
			    + "\trequire 'vendor/autoload.php';\n"
			    + "\tuse GuzzleHttp\\Client;\n";

	var documentation = "";
	if (typeof description.documentation !== "undefined") {
		documentation = '\t/*\n'
					  + '\tDocumentation:\n'
					  + '\t\tTitle: '+ (description.documentation.title || "") + '\n'
					  + '\t\tContent: '+ (description.documentation.content || "") + '\n\n'
					  + '\t*/\n';
	}

	var classcomments   = '\t/// <summary>\n'
						+ '\t/// ' + description.title + ' Client API\n'
						+ '\t/// Version:'+ (typeof description.version === "undefined" ? "" : description.version) + '\n'
						+ '\t/// </summary>\n'

	var classdeclaration = '\tclass RestClient \n'
	                     + '\t{\n'
	                     + '\t\tprivate $client;\n'
	                     + '\t\tprivate $acceptHeader;\n'
	                     + '\t\tprivate $baseUrl;\n\n'
	                     + '\t\tpublic function __construct($baseUrl,$acceptHeader) { \n'
	                     + '\t\t\t$this->client = new Client([\'base_url\' => \'$baseUrl\']);\n'
	                     + '\t\t\t$this->baseUrl = $baseUrl;\n'
	                     + '\t\t\t$this->acceptHeader = $acceptHeader;\n'
	                     + '\t\t}\n\n';
	
	var functions = '';
	if(typeof description.resources !== "undefined") { 
		for(var i = 0; i < description.resources.length; i++) {
			functions += GenerateFunctionClient(description.resources[i], description.resources[i]);
		}
	}

	var closingStatements = '\t}\n'
						  + '?>';

	return phpFile + documentation + classcomments + classdeclaration + functions + closingStatements;
}

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
	var functionComment = '\t\t/// <summary>\n'
					    + '\t\t/// '+method.method+resource.uniqueId+'\n'
					    + '\t\t/// Documentation: '+method.description+'\n'
					    + '\t\t/// </summary>\n';
    
    var uriParameters = "";
    if(typeof resource.uriParameters !== "undefined") { 
        for(var j in resource.uriParameters) { 
            uriParameters += ' $'+ resource.uriParameters[j].displayName +',';
            functionComment += '\t\t/// <param name="'+resource.uriParameters[j].displayName+'">'+resource.uriParameters[j].description+'</param>\n';
        }
    }

	var queryParameters = "";
	if(typeof resource.queryParameters !== "undefined") { 
	    for(var j in resource.queryParameters) { 
	        queryParameters += ' $'+ resource.queryParameters[j].displayName +',';
	        functionComment += '\t\t/// <param name="'+resource.queryParameters[j].displayName+'">'+resource.queryParameters[j].description+'</param>\n';
	    }
	}

	var putPostParam = '';
	if(method.method == 'put' || method.method == 'post') { 
		putPostParam = '$body, $contentType';
		functionComment += '\t\t/// <param name="body">This is the body of the message.</param>\n'; 
		functionComment += '\t\t/// <param name="contentType">This is the type of data you are sending in the body.</param>\n';
	}
	functionComment += '\t\t/// <returns></returns>\n';
	
	return functionComment + GenerateFunctionBody(method, resource, uriParameters, queryParameters, putPostParam);	
}

function GenerateFunctionBody(method, resource, uriParameters, queryParameters, putPostParam){
	var parameters = uriParameters + queryParameters + putPostParam;
	parameters = parameters[parameters.length-1] == ',' ? parameters.substring(0, parameters.length-1) : parameters;
	var functionName = '\t\tpublic function '+method.method+resource.uniqueId+'('+ parameters +') {\n'
					 + '\t\t\t$relativeUri = "' + (resource.parentUrl || '') + resource.relativeUri + '";\n';
	
	var clientOptions = GetClientOptions(resource.uriParameters, resource.queryParameters, method.method);
    
    switch(method.method){
    	case 'get':
    		functionName += '\t\t\treturn $this->client->get($this->baseUrl . $relativeUri, '+clientOptions.options+');\n';
    		break;
    	case 'put':
    		functionName += '\t\t\treturn $this->client->put($this->baseUrl . $relativeUri, '+clientOptions.options+');\n';
    		break;
    	case 'post':
    		functionName += '\t\t\treturn $this->client->post($this->baseUrl . $relativeUri, '+clientOptions.options+');\n';
    		break;
    	case 'delete':
    		functionName += '\t\t\treturn $this->client->delete($this->baseUrl . $relativeUri, '+clientOptions.options+');\n';
    		break;
    	case 'patch':
    		functionName += '\t\t\treturn $this->client->patch($this->baseUrl . $relativeUri, '+clientOptions.options+');\n';
    		break;
    }

	functionName += '\t\t}\n\n';
	return functionName;
}

function GetClientOptions(uriParameters, queryParameters, method){
	var uri = '';
	if(uriParameters){
		for(var x in uriParameters){
			uri += '\''+uriParameters[x].displayName+'\' => $'+uriParameters[x].displayName+', ';
		}
		uri = uri.trim();
		uri = uri.substr(0, uri.length-1);
		uri = '\'uri\' => ['+uri+'], ';
	}

	var headers = '\'headers\' => [ \'Accept\' => $this->acceptHeader], ';

	var query = '';
	if(queryParameters){
		for(var i in queryParameters){
			query += '\''+queryParameters[x].displayName+'\' => $'+queryParameters[x].displayName+', ';
		}
		query = query.trim();
		query = query.substr(0, query.length-1);
		query = '\'query\' => ['+query+'], ';
	}

	var body = '';
    if(method == 'put' || method == 'post'){
    	body = '\'body\' => $body, ';
    }

    if(uri == '' && query == '' && body == '') return { 'options':'[]' };

    var options = Coalescing(uri) + headers + Coalescing(body) + Coalescing(query);
    options = options.trim();
    options = options.substr(0, options.length-1);
    return { 'options':'[' + options +']' };
}

function Coalescing(value){
	if(!value || value == ''){
		return '';
	}
	else{
		return value;
	}
}