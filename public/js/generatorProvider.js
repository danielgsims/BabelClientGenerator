var clientGeneratorProvider = (function () {
	function clientGeneratorProvider(httpService) {
        this.httpService = httpService;
    }

    clientGeneratorProvider.prototype.GetRamlUrl = function(url, successFallback, errorFallback){
        $http({method: 'GET', url: url})
             .success(successFallback)//http://localhost:8060/api/raml
             .error(errorFallback);
    }

    clientGeneratorProvider.prototype.PostRamlForJson = function(raml){

    	return raml;
    }

    clientGeneratorProvider.prototype.PostJsonForClientCode = function(jsonObj){
    	return jsonObj;
    }

    return clientGeneratorProvider;
})();