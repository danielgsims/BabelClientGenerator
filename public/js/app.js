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
    .controller('homeContentController', function($http, $scope, $interval, generatorProvider) {
        $scope.startGenerator = true;

        $scope.generate = function(){
            $scope.loading = true;
            $scope.startGenerator = false; 

            try {
                var raml = $scope.raml;
                $http.get(raml.url) // GETS THE RAML FILE
                    .success(function (data) {
                        $http({
                             'url': '/api/descriptions',
                             'method': 'post',
                             'headers': {
                               'Accept': 'application/json',
                               'Content-Type': undefined
                             },
                             'data': data
                        }).success(function(data){  //GETS JSON FOR A RAML FILE
                                $http({
                                     'url': '/api/clients',
                                     'method': 'post',
                                     'headers': {
                                        'Accept': 'text/plain',
                                        'Content-Type': undefined
                                     },
                                     'data': JSON.stringify({ 'description':data,'languageType':'C#' })
                                }).success(function(data){
                                    $scope.client = data;
                                    $scope.hasRamlResult = true;
                                    $scope.loading = false;
                                    $scope.startGenerator = true;
                                }).error(function (data) {
                                    $scope.client = "Error.";
                                    $scope.hasRamlResult = true;
                                    $scope.loading = false;
                                    $scope.startGenerator = true;
                                });
                         })
                         .error(function (data) {
                                $scope.client = "Error.";
                                $scope.hasRamlResult = true;
                                $scope.loading = false;
                                $scope.startGenerator = true;
                        });
                    })
                    .error(function (data) {//, status, headers, config) {
                        $scope.client = "Error.";
                        $scope.hasRamlResult = true;
                        $scope.loading = false;
                        $scope.startGenerator = true;
                    });

            }
            catch(err) {
                $scope.hasRamlResult = true;
                $scope.loading = false;
                $scope.startGenerator = true;
            }
        }
    });

routerApp.factory('generatorProvider', function($http, $log, $q) {
    return new clientGeneratorProvider($http);    
});