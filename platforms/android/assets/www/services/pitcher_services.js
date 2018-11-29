angular.module('services.pitcher', [])
.factory('PitcherService', ["$rootScope", "$q",'dataService', function($rootScope, $q, dataService) {

  return {

    getMostRecentPullValue: function(pitcher){
      var id = pitcher.id;
      var def = $q.defer();

      dataService.getObj('pitching-data',{pitcher: id})
      .then(function(result){
        if(result && result.length > 0){
          def.resolve(result[0].mainValue);
        }else{
          def.resolve(0);
        }
      });

      return def.promise;
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
      var data = {
        id: pitcher.id,
      }
      data.baselines = [];
      data.baselines.push({value: baseline});
      dataService.saveObj('pitchers',data)
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

      dataService.saveObj('pitchers',data)
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
      if(typeof teamId == 'undefined')
        return 'ERROR: teamId not found in localStorage';
      team.push(teamId);

      console.log('teamId,team in PitcherService.getPitchers',teamId,team);

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
        console.log('ERROR in PitcherService.getPitchers',err);
        def.reject(err);
      })
      return def.promise;
    },

    getPitcher : function(id) {
      var def = $q.defer();

      dataService.getObj('pitchers',{ _id : id})
      .then(function(response) {
        if(response)
          response = response;
        if(response.length > 0)
          response = response[0];
        def.resolve(response);
      }, function(err) {
        def.reject(err);
      })
      return def.promise;
    },

    updatePitcher : function(pitcher) {
      var def = $q.defer();
      var currId = pitcher.id ? pitcher.id : pitcher._id;
      var data = {
        id: currId,
        _id: currId,
        name: pitcher.name,
        jersey_number: pitcher.jersey_number,
        age: pitcher.age,
        height : pitcher.height,
        weight : pitcher.weight,
        stride_length : pitcher.stride_length,
        device_height : pitcher.device_height,
        unique_id: pitcher.unique_id
      }

      dataService.saveObj('pitchers',data)
      .then(function(response) {
        def.resolve(response);
      }, function(err) {
        def.reject(err);
      })
      return def.promise;
    },

    getPitchersData: function(pitcher){
      var id = pitcher.id;
      var def = $q.defer();

      dataService.getObj('pitching-data',{pitcher: id})
      .then(function(result){
        if(result && result.length > 0){
          def.resolve(result);
        }else{
          def.resolve(0);
        }
      });

      return def.promise;
    }, 
  
  }
}]);