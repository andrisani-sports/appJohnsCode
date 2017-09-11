(function(gScope){

angular.module(gScope.AppNameId)
.controller('accountController', ['$scope','$rootScope','$log','$location','AccountService', init]);

  function init($scope,$rootScope,$log,$location,AccountService){

    var errorHandler = function(options) {
      console.log('ERROR: ', options);
      // var errorAlert = $ionicPopup.alert({
      //   title: options.title,
      //   okType : 'button-assertive',
      //   okText : "Try Again"
      // });
    }

    var vm = this;

    vm.rememberMe = {}; // from the Remember Me button on login page

    vm.user = {};

    vm.login = AccountService.login;

  }

})(this);