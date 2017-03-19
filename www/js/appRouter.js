(function(gScope){
//provides the routing for the different pages of the app.

var app=angular.module(gScope.AppNameId, ['ngRoute']);

app.config(['$routeProvider', '$logProvider', function($routeProvider, $logProvider){

  
	$logProvider.debugEnabled(true);
 
	$routeProvider
  	.when('/home', {
  			templateUrl: 'pages/home/home.html',
  			controller: 'homeController',
  			controllerAs: 'home',
  	})
    .when('/splash', {
        templateUrl:'pages/splash/splash.html',
        controller: 'splashController',
        conterollerAs: 'splash',
    })
  	.otherwise({redirectTo: '/splash'});


}]);


})(this);