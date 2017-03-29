(function(gScope){
//provides the routing for the different pages of the app.

var app = angular.module(gScope.AppNameId, ['ngRoute','mobile-angular-ui','starter.services']);

app.config(['$routeProvider', '$logProvider', '$locationProvider', 
function($routeProvider, $logProvider,$locationProvider){
  
// 	function checkUserStatus($state, AccountService){
// debugger;
//       if(!AccountService.isLoggedIn()){
//          $state.go('login');
//       }
//   }

  var path = ''; // android_asset/www/

  $logProvider.debugEnabled(true);

  $locationProvider.hashPrefix('');

	$routeProvider
  	.when('/', {
  			templateUrl: path + 'pages/home/home.html',
  			controller: 'homeController',
  			controllerAs: 'home'
        // resolve: checkUserStatus
  	})
    .when('/login', {
      templateUrl: path + 'pages/login/loginTemplate.html',
      controller: 'accountController',
      controllerAs: 'account'
    })
    .when('/splash', {
        templateUrl: path + 'pages/splash/splash.html',
        controller: 'splashController',
        conterollerAs: 'splash',
        // resolve: checkUserStatus
    })
    .when('/pitchers', {
        templateUrl: 'pages/pitchers/listPitchers.html',
        controller: 'pitchersController',
        conterollerAs: 'pitchers',
    })
    .when('/pitcher/add', {
        templateUrl: 'pages/pitchers/addPitcher.html',
        controller: 'pitchersController',
        conterollerAs: 'pitchers',
    })
    .when('/pitcher/:id', {
        templateUrl: path + 'pages/pitchers/viewPitcher.html',
        controller: 'pitchersController',
        conterollerAs: 'pitchers',
    })
    .when('/pitcher/edit/:id', {
        templateUrl: path + 'pages/pitchers/editPitcher.html',
        controller: 'pitchersController',
        conterollerAs: 'pitchers',
    })
  	.otherwise({redirectTo: '/'});

    // use the HTML5 History API
    // $locationProvider.html5Mode({
    //   enabled: false, 
    //   requireBase: false,
    //   rewriteLinks: false 
    // });

}]);

app.run(function(AccountService,$location,$rootScope){

  $rootScope.$on('$routeChangeStart', function (event) {

    var currPath = $location.path();

    AccountService
    .currentUser()
    .then(function(user) {
      event.preventDefault();
      if(!user && currPath != '/login')
        $location.path('/login');
    });

  });

});


})(this);