(function(gScope){

angular
.module(gScope.AppNameId)
.controller('accountController', ['$scope','$rootScope','$log', 'chartService', 'bluetoothService', 'PitcherService', init]);


function init(AccountService, $state, $rootScope){

  var errorHandler = function(options) {
    // var errorAlert = $ionicPopup.alert({
    //   title: options.title,
    //   okType : 'button-assertive',
    //   okText : "Try Again"
    // });
  }

  var vm = this;

  vm.login = function() {
    // $ionicLoading.show();
    Stamplay.User.login(vm.user)
    .then(function(user) {
      window.localStorage['user'] = JSON.stringify(user);
      $state.go("app.start");
    }, function(error) {
      // $ionicLoading.hide();
      errorHandler({
        title : "<h4 class='center-align'>Incorrect Username or Password</h4>"
      })
    })
  }

  vm.logout = function() {
    // $ionicLoading.show();
    var jwt = window.location.origin + "-jwt";
    window.localStorage.removeItem(jwt);
    AccountService.currentUser()
    .then(function(user) {
      window.localStorage['user'] = user;
      // $ionicLoading.hide();
    }, function(error) {
      console.error(error);
      // $ionicLoading.hide();
    })
  }
}

})(this);