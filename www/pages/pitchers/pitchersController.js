(function(gScope){
	
angular.module(gScope.AppNameId)
	.controller('pitchersController', ['$scope', '$rootScope', '$log', '$location', '$routeParams', 'chartService', 'bluetoothService', 'PitcherService', init]);

function init($scope,$rootScope,$log,$location,$routeParams,chartService,bluetoothService,PitcherService){

	PitcherService.getPitchers().then(function(result){
		$scope.pitchers = result;
	});

	if ($routeParams.id) {
		var id = $routeParams.id;
		PitcherService.getPitcher(id).then(function(result){
			$scope.pitcher = result[0];
		});	
	}

	$scope.choosePitcher = function(pitcher){
		$rootScope.chosenPitcher = pitcher;
		$location.path('/home');
	}

}

})(this);