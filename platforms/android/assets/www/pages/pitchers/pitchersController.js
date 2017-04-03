(function(gScope){
	
angular.module(gScope.AppNameId)
	.controller('pitchersController', ['$scope', '$rootScope', '$log', '$location', '$routeParams', 'chartService', 'bluetoothService', 'PitcherService', init]);

function init($scope,$rootScope,$log,$location,$routeParams,chartService,bluetoothService,PitcherService){

	console.log('init pitchersController...');

	PitcherService.getPitchers().then(function(result){
		$rootScope.pitchers = result;
	});

	if ($routeParams.id) {
		// set id from $routeParams
		var id = $routeParams.id;
		
		// get pitcher by $routeParams.id
		PitcherService.getPitcher(id).then(function(result){
			$scope.pitcher = result[0];
		});

	}

	// create pitcher
	$scope.createPitcher = function(pitcher) {
		PitcherService.createPitcher(pitcher).then(function(result){
			$location.path('/');	
			// Need to figure out how to update the pitchers sidebar when a new pitcher is created $scope.apply around push to pitchers array
			// console.log('new pitcher created', result);
			// $scope.pitchers.push(result);
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
		console.log('in choosePitcher()...',pitcher);
		if(!$scope.$$phase) {
			console.log('stopped digesting');
			$scope.$apply(function(){
				$rootScope.chosenPitcher = pitcher;
			});
		}else{
			console.log('still digesting');
			$rootScope.chosenPitcher = pitcher;
		}
		PitcherService.getMostRecentPullValue(pitcher).then(function(result){
			$rootScope.currLastPull = result;
		});
		$rootScope.currBaseline = PitcherService.getCurrBaseline(pitcher);
		// $location.path('/home');
		// sidebar is closed by the ui-turn-off='uiSidebarRight' attrib in right_sidebar.html
	}

}

})(this);