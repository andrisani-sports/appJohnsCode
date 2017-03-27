angular.module('starter.services', [])

.factory('AccountService', ['$q','$rootScope','$location','$timeout', function($q,$rootScope,$location,$timeout) {
  
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

    getMostRecentPullValue: function(pitcher){
      var id = pitcher.id;
      return Stamplay.Object('pitchers')
      .get({})
      .then(function(result){
        var value;
        value = result.data[0];
        return value;
      });
    },

    getCurrBaseline: function(pitcher){
      var baseLine;

      // assume that most recent baseline will be at [0]
      if(pitcher.baselines && pitcher.baselines.length > 0)
        baseLine = pitcher.baselines[0].value;
      else
        baseLine = 0;

      return baseLine;
    },

    createPitcher : function(pitcher) {
      var def = $q.defer();

      var data = {
        name: pitcher.name,
        age: pitcher.age,
        height : pitcher.height,
        weight : pitcher.weight,
        stride_length : pitcher.stride_length,
        device_height : pitcher.device_height,
        // team: pitcher.team
      }

      Stamplay.Object('pitchers').save(data)
      .then(function(response) {

        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        function guid() {
          return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
        }
        
        var uuid = guid();
        var pitcherID = response._id;
        var updateData = {
          unique_id: uuid
        }
        
        Stamplay.Object('pitchers').update(pitcherID, updateData)
        .then(function(response) {
          def.resolve(response);
        }, function(err) {
          def.reject(err);
        })
        return def.promise;
        

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

.factory('IssueService', ["$rootScope", "$q", function($rootScope, $q) {

  return {

    sendIssue : function(issue) {
      var def = $q.defer();

      var data = {
        name: issue.name,
        email: issue.email,
        message : issue.message
      }

      Stamplay.Object('issues').save(data)
      .then(function(response) {
        console.log('new issue', response);
        def.resolve(response);
      }, function(err) {
        def.reject(err);
      });

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