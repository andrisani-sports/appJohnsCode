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

    createPitcher : function(data) {
      var def = $q.defer();

      Stamplay.Object('pitchers').save(data)
      .then(function(response) {
        def.resolve(response);
      }, function(err) {
        def.reject(err);
      })
      return def.promise;
    },

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
    },

    updatePitcher : function(pitcher) {
      var def = $q.defer();

      var data = {
        name: pitcher.name,
        age: pitcher.age,
        height : pitcher.height,
        weight : pitcher.weight,
        stride_length : pitcher.stride_length,
        device_height : pitcher.device_height
    }

      Stamplay.Object('pitchers').update(pitcher._id, data)
      .then(function(response) {
        def.resolve(response);
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