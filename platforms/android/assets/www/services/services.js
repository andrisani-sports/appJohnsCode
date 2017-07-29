angular.module('starter.services', [])

.factory('AccountService', ['$q','$rootScope','$location','$timeout','dataService', function($q,$rootScope,$location,$timeout,dataService) {

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

    login: function(user) {
      Stamplay.User.login(user)
      .then(function(user) {
        window.localStorage['user'] = JSON.stringify(user);
        window.localStorage['userTeam'] = user.team;
        console.log('userTeam', user.team);
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

.factory('PulldataService', ["$rootScope", "$q",'dataService', function($rootScope, $q, dataService) {

  return {
    save: function(data){
      console.log('PulldataService -> save(), data length',data.length, ' data',data);
      dataService.saveObj('pitching_data',data);
    }
  }

}])

.factory('PitcherService', ["$rootScope", "$q",'dataService', function($rootScope, $q, dataService) {

  return {

    getMostRecentPullValue: function(pitcher){
      var id = pitcher.id;
      return Stamplay.Object('pitching_data')
      .get({pitcher: id})
      .then(function(result){
        if(result.length > 0){
          return result.data[0].mainValue;
        }else{
          return 0;
        }
      });
    },

    getCurrBaseline: function(pitcher){
      var baseLine;
      var def = $q.defer();

      // assume that most recent baseline will be at [0]
      if(pitcher.baselines && pitcher.baselines.length > 0)
        baseLine = pitcher.baselines[0].value;
      else
        baseLine = 0;
      def.resolve(baseLine);

      return def.promise;
    },

    updateCurrBaseline: function(pitcher,baseline){
      var def = $q.defer();
      var data = pitcher;
      data.currBaseline = baseline;
      Stamplay.Object('pitchers').save(data)
      .then(function(response) {
        def.resolve(response);
      }, function(err) {
        def.reject(err);
      })
      return def.promise;
    },

    createPitcher: function(pitcher) {
      var def = $q.defer();
      
      // Get team from logged user and set that ID to pitcher.team
      var userTeam = window.localStorage.getItem('userTeam');
      var pitcherTeam = [];
      pitcherTeam.push(userTeam);

      // Generate a unique ID for each pitcher
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
      }
      function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
      }
      
      var uuid = guid();

      var data = {
        unique_id: uuid,
        name: pitcher.name,
        age: pitcher.age,
        height : pitcher.height,
        weight : pitcher.weight,
        stride_length : pitcher.stride_length,
        device_height : pitcher.device_height,
        team: pitcherTeam
      }

      Stamplay.Object('pitchers').save(data)
      .then(function(response) {

        console.log('New pitcher created', response);

        def.resolve(response);
      }, function(err) {
        def.reject(err);
      })
      return def.promise;
    },

    getPitchers : function(query) {
      var def = $q.defer();
      var team = [];
      var teamId = window.localStorage['userTeam'];
      team.push(teamId);

      console.log('teamId,team in PitcherService.getPitchers',teamId,team);

      // Stamplay.Object('pitchers').get({'team':team})
      dataService.getObj('pitchers',{'team':team})
      .then(function(response) {
        if(response){
          console.log('response in PitcherService.getPitchers',response);
          if(response.data)
            def.resolve(response.data);
          else
            def.resolve(response);
        }else{
          console.log('no data found in PitcherService.getPitchers',response);
          def.reject('no data found');
        }
      }, function(err) {
        console.log('ERROR in PitcherService.getPitchers',response);
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

.factory('IssueService', ["$rootScope", "$q", 'dataService', function($rootScope, $q, dataService) {

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

.factory('TeamService', ["$rootScope", "$q", 'dataService', function($rootScope, $q, dataService) {

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