(function(gScope){
	
angular.module(gScope.AppNameId)
	.controller('pitchersController', ['$scope', '$rootScope', '$log', '$location', '$routeParams', 'chartService', 'bluetoothService', 'PitcherService', init]);


function init($scope,$rootScope,$log,$location,$routeParams,chartService,bluetoothService,PitcherService){

	PitcherService.getPitchers().then(function(result){
		$scope.pitchers = result;
	});

	if ($routeParams.id) {
		// set id from $routeParams
		var id = $routeParams.id;
		

		// get pitcher by $routeParams.id
		PitcherService.getPitcher(id).then(function(result){
			$scope.pitcher = result[0];
		});

	}

	// update pitcher
	$scope.updatePitcher = function(pitcher) {
		PitcherService.updatePitcher(pitcher).then(function(result){
			$location.path('/pitchers');	
		});
	}
	
	// choose pitcher to run test
	$scope.choosePitcher = function(pitcher){
		$rootScope.chosenPitcher = pitcher;
		$location.path('/home');
	}

}

})(this);