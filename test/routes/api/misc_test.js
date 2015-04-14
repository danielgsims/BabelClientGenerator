var misc = require('../../../routes/api/misc');

exports.Misc_PostmanRouteWorks = function(test){
	var dictOfRoutes = [];
	
	var requestMock = {};
	var responseMock = {
		'set':function(header, value){
			test.equal(header, 'Content-Type', 'There should be header Content-Type.');
			test.equal(value, 'application/json', 'Content-Type should be application/json');
		},
		'status':function(value){
			test.equal(value, 200, 'Response should be 200.');
			return responseMock;
		},
		'send':function(postman){
			test.notStrictEqual(postman !== null, 'This should return a json object.');
		},
		'end':function(){
			test.done();
		}
	};

	var appMock = {
		'get':function(key, func){
			dictOfRoutes[key] = func;
		}
	};
	
	var locationMock = '../../../';
	misc(appMock, locationMock);
	dictOfRoutes['/api/postman'](requestMock, responseMock);
}
