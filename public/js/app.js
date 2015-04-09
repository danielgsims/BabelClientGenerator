var routerApp = angular.module('RESTClientGenerator', ['ui.router']);  

routerApp.config(function($stateProvider, $urlRouterProvider) {

	$urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', {
            url : '/',
            views : {
                'content': {
                    templateUrl: 'partials/home/content.html',
                    controller: 'homeContentController'
                }
            }
        });
    });

routerApp
    .controller('homeContentController', function($scope, $interval, generatorProvider) {        
        var raml = generatorProvider.GetRamlUrl('http://derp.com/derp');
        var jsonOfRaml = generatorProvider.PostRamlForJson(raml);

        $scope.message = generatorProvider.PostJsonForClientCode(jsonOfRaml);

        $scope.generate = function(){
        	$scope.hasRamlResult = !$scope.hasRamlResult;
        }
    });

routerApp.factory('generatorProvider', function($http, $log, $q) {
    return new clientGeneratorProvider($http);    
});