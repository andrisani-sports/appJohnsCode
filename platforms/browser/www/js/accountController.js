(function(gScope){

angular.module(gScope.AppNameId)
.controller('accountController', ['$scope','$rootScope','$log','$location','AccountService', init]);

  function init($scope,$rootScope,$log,$location,AccountService){
    
    console.log('init()');

    var errorHandler = function(options) {
      console.log('ERROR: ', options);
    }

    var vm = this;

    vm.rememberMe = {}; // from the Remember Me button on login page

    vm.user = {};

    vm.login = AccountService.login;

  }

})(this);