(function(gScope){
//provides the routing for the different pages of the app.

var app=angular.module(gScope.AppNameId, ['ngRoute','mobile-angular-ui','starter.services']);

app.config(['$routeProvider', '$logProvider', '$locationProvider', function($routeProvider, $logProvider,$locationProvider){
  
	$logProvider.debugEnabled(true);
 
	$routeProvider
    .when('/login', {
      templateUrl: 'pages/login/loginTemplate.html',
      controller: 'accountController',
      controllerAs: 'account',
    })

  	.when('/', {
  			templateUrl: 'pages/home/home.html',
  			controller: 'homeController',
  			controllerAs: 'home',
  	})
    .when('/pull', {
        templateUrl: 'pages/pull/pull.html',
        controller: 'pullController',
        controllerAs: 'pull',
    })
    .when('/splash', {
        templateUrl:'pages/splash/splash.html',
        controller: 'splashController',
        conterollerAs: 'splash',
    })
  	.otherwise({redirectTo: '/'});

    // use the HTML5 History API
    $locationProvider.html5Mode(true);

}]);

app.run(function(AccountService){
  AccountService.currentUser()
    .then(function(user) {
      window.localStorage['user'] = user;
    })
});


})(this);