var clientGeneratorProvider = (function () {
	function clientGeneratorProvider(httpService) {
        this.httpService = httpService;
    }

    clientGeneratorProvider.prototype.GetRamlUrl = function(url){
    	return 'raml';
    }

    clientGeneratorProvider.prototype.PostRamlForJson = function(raml){
    	return {'the':'json'};
    }

    clientGeneratorProvider.prototype.PostJsonForClientCode = function(jsonObj){
    	return 'the string of client code';
    }

    return clientGeneratorProvider;
})();