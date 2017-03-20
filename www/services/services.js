angular.module('starter.services', [])

.factory('AccountService', ['$q','$rootScope', function($q,$rootScope) {
  return {

    isLoggedIn: function () {
      var userStatus = window.localStorage['user'] != 'false' ? true : false;
      return userStatus;
    },

    currentUser : function() {
      var def = $q.defer();
      Stamplay.User.currentUser()
      .then(function(response) {
        if(response.user === undefined) {
          def.resolve(false);
        } else {
          def.resolve(response.user);
        }
      }, function(error) {
        def.reject();
      })
      return def.promise;
    } // end currentUser()

  } // end return{}

}])

.factory('PitcherService', ["$rootScope", "$q", function($rootScope, $q) {

  return {

    getPitchers : function(query) {
      var deffered = $q.defer();

      Stamplay.Object('pitchers').get({})
      // .findByCurrentUser(["owner"])
      .then(function(response) {
        deffered.resolve(response.data)
      }, function(err) {
        deffered.reject(err);
      })
      return deffered.promise;
    }
  
  }
}])

.factory('TeamService', ["$rootScope", "$q", function($rootScope, $q) {

  return {

    getTeams : function(query) {
      var deffered = $q.defer();

      Stamplay.Object('teams').get({})
      // .findByCurrentUser(["owner"])
      .then(function(response) {
        deffered.resolve(response.data)
      }, function(err) {
        deffered.reject(err);
      })
      return deffered.promise;
    }
  
  }
}])

;