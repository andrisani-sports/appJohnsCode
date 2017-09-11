(function(gScope){
//provides the routing for the different pages of the app.

var app = angular.module(gScope.AppNameId, [
  'ngRoute',
  'mobile-angular-ui',
  'starter.services',
  'ngStorage',
  'ngDomEvents'
]);

app.config(['$routeProvider', '$logProvider', '$locationProvider', '$provide',
function($routeProvider, $logProvider,$locationProvider, $provide){

  // $provide.decorator("$rootScope", function($delegate) {
  //   var Scope = $delegate.constructor;
  //   var origBroadcast = Scope.prototype.$broadcast;
  //   var origEmit = Scope.prototype.$emit;

  //   Scope.prototype.$broadcast = function() {
  //     console.log("$broadcast was called on --" + arguments[0] + "-- with arguments:",
  //                        arguments);
  //     return origBroadcast.apply(this, arguments);
  //   };
  //   Scope.prototype.$emit = function() {
  //     console.log("$emit was called on --" + arguments[0] + "-- with arguments:",
  //                        arguments);
  //     return origEmit.apply(this, arguments);
  //   };
  //   return $delegate;
  // });

  ////////////////////////////////////////////////////

  var path = ''; // android_asset/www/

  $logProvider.debugEnabled(true);

  $locationProvider.hashPrefix('');

	$routeProvider
  	.when('/home', {
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
    .when('/bluetooth/setup/', {
      templateUrl: path + 'pages/bluetooth/setupBluetooth.html',
      controller: 'bluetoothController',
      controllerAs: 'bt'
    })
  	.otherwise({redirectTo: '/splash'});

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