var assert = require("assert");
var misc = require('../routes/api/misc');

describe('Misc', function(){
	describe('#ReturnPostman', function(){
		it('should return postman stuff', function(done){
			var dictOfRoutes = [];
	
			var requestMock = {};
			var responseMock = {
				'set':function(header, value){
					assert.equal(header, 'Content-Type');
					assert.equal(value, 'application/json');
				},
				'status':function(value){
					assert.equal(value, 200);
					return responseMock;
				},
				'send':function(postman){
					assert.notStrictEqual(postman !== null);
				},
				'end':function(){
					done();
				}
			};

			var appMock = {
				'get':function(key, func){
					dictOfRoutes[key] = func;
				}
			};
			
			var locationMock = './';
			misc(appMock, locationMock);
			dictOfRoutes['/api/postman'](requestMock, responseMock);
		})
	})
})
