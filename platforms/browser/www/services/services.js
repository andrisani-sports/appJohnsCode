angular.module('starter.services', [])

.factory('AccountService', 
['$q','$rootScope','$location','$timeout','dataService', 
function($q,$rootScope,$location,$timeout,dataService) {

  function currentUser() {
    var def = $q.defer();

    if(window.localStorage['user'] && window.localStorage['user'] != ''){
      var user = JSON.parse(window.localStorage['user']);
      if(!user._id)
        def.resolve(false);
      else
        def.resolve(user);
    }else{
      def.resolve(false);
    }
    
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

    login: function(user){
      dataService.login(user);
      $location.path('/');
    },

    currentUser: currentUser

  } // end return{}

}])

.factory('PulldataService', ["$rootScope", "$q",'dataService', function($rootScope, $q, dataService) {

  return {
    save: function(data){
      console.log('PulldataService -> save(), data length',data.length, ' data',data);
      dataService.saveObj('pitching-data',data);
    }
  }

}])



.factory('IssueService', ["$rootScope", "$q", 'dataService', function($rootScope, $q, dataService) {

  return {

    sendIssue : function(issue) {
      var def = $q.defer();

      var data = {
        name: issue.name,
        email: issue.email,
        message : issue.message
      }

      dataService.saveObj('issues',data)
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

.factory('TeamService', ["$rootScope", "$q", 'dataService', function($rootScope, $q, dataService) {

  return {

    getTeams : function(query) {
      var def = $q.defer();

      dataService.getObj('teams',{})
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