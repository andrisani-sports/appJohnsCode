(function(gScope){
//provides the routing for the different pages of the app.

var app = angular.module(gScope.AppNameId, [
  'ngRoute',
  'mobile-angular-ui',
  'starter.services',
  'services.pitcher',
  'ngStorage',
  'ngDomEvents'
]);

app.config(['$routeProvider', '$logProvider', '$locationProvider', '$provide',
function($routeProvider, $logProvider, $locationProvider, $provide){

  var path = ''; // android_asset/www/

  $logProvider.debugEnabled(true);

  $locationProvider.hashPrefix('');

	$routeProvider
  	.when('/home', {
  			templateUrl: path + 'pages/home/home.html',
  			controller: 'homeController',
  			controllerAs: 'home'
  	})
    .when('/login', {
      templateUrl: path + 'pages/login/loginTemplate.html',
      controller: 'accountController',
      controllerAs: 'account'
    })
    .when('/splash', {
        templateUrl: path + 'pages/splash/splash.html',
        controller: 'splashController',
        controllerAs: 'splash',
    })
    .when('/pitchers', {
        templateUrl: 'pages/pitchers/listPitchers.html',
        controller: 'pitchersController',
        controllerAs: 'pitchers'
    })
    .when('/pitcher/add', {
        templateUrl: 'pages/pitchers/addPitcher.html',
        controller: 'pitchersController',
        controllerAs: 'pitchers',
    })
    .when('/pitcher/:id', {
        templateUrl: path + 'pages/pitchers/viewPitcher.html',
        controller: 'pitchersController',
        controllerAs: 'pitchers',
    })
    .when('/pitcher/edit/:id', {
        templateUrl: path + 'pages/pitchers/editPitcher.html',
        controller: 'pitchersController',
        controllerAs: 'pitchers',
    })
    .when('/pitcher/data/:id', {
        templateUrl: path + 'pages/pitchers/pitcherData.html',
        controller: 'pitchersController',
        controllerAs: 'pitchers',
    })
    .when('/bluetooth/setup/', {
      templateUrl: path + 'pages/bluetooth/setupBluetooth.html',
      controller: 'bluetoothController',
      controllerAs: 'bt'
    })
  	.otherwise({redirectTo: '/splash'});

}]);

app.run(function(AccountService,$location,$rootScope){
console.log('appRouter line 119');
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