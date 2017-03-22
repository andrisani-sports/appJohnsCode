(function(gScope){
	
angular.module(gScope.AppNameId)
	.controller('pitchersController', ['$scope', '$rootScope', '$log', '$location', 'chartService', 'bluetoothService', 'PitcherService', init]);


function init($scope,$rootScope,$log,$location,chartService,bluetoothService,PitcherService){

	PitcherService.getPitchers().then(function(result){
		$scope.pitchers = result;
	});

	$scope.choosePitcher = function(pitcher){
		$rootScope.chosenPitcher = pitcher;
		$location.path('/home');
	}

}

})(this);