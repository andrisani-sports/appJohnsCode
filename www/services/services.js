angular.module('starter.services', [])

.factory('AccountService', ['$q','$rootScope','$location', function($q,$rootScope,$location) {
  
  function currentUser() {
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

  return {

    isLoggedIn: function () {
      var userStatus = window.localStorage['user'] != 'false' ? true : false;
      return userStatus;
    },

    logout: function() {
      var jwt = window.location.origin + "-jwt";
      window.localStorage.removeItem(jwt);
      currentUser()
      .then(function(user) {
        window.localStorage['user'] = user;
        $location.path('/login')
      }, function(error) {
        console.error(error);
      })
    },

    login: function(user) {
      Stamplay.User.login(user)
      .then(function(user) {
        window.localStorage['user'] = JSON.stringify(user);
        $rootScope.$apply(function(){
          $location.path('/');
        });
      }, function(error) {
        errorHandler({
          title : "<h4 class='center-align'>Incorrect Username or Password</h4>"
        })
      })
    },

    currentUser: currentUser

  } // end return{}

}])

.factory('PitcherService', ["$rootScope", "$q", function($rootScope, $q) {

  return {

    getPitchers : function(query) {
      var def = $q.defer();

      Stamplay.Object('pitchers').get({})
      // .findByCurrentUser(["owner"])
      .then(function(response) {
        def.resolve(response.data);
      }, function(err) {
        def.reject(err);
      })
      return def.promise;
    },

    getPitcher : function(id) {
      var def = $q.defer();

      Stamplay.Object('pitchers').get({ _id : id})
      .then(function(response) {
        def.resolve(response.data);
      }, function(err) {
        def.reject(err);
      })
      return def.promise;
    }
  
  }
}])

.factory('TeamService', ["$rootScope", "$q", function($rootScope, $q) {

  return {

    getTeams : function(query) {
      var def = $q.defer();

      Stamplay.Object('teams').get({})
      // .findByCurrentUser(["owner"])
      .then(function(response) {
        def.resolve(response.data)
      }, function(err) {
        def.reject(err);
      })
      return def.promise;
    }
  
  }
}])

;