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
			$scope.pitcher = result;
		});

	}

	// create pitcher
	$scope.createPitcher = function(pitcher) {
		$rootScope.$broadcast('savingData');
		PitcherService.createPitcher(pitcher).then(function(result){
			$rootScope.$broadcast('doneSavingData');
			$location.path('/home');
		});
	}

	// update pitcher
	$scope.updatePitcher = function(pitcher) {
		$rootScope.$broadcast('savingData');
		PitcherService.updatePitcher(pitcher).then(function(result){
			$rootScope.$broadcast('doneSavingData');
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
			console.log('in getMostRecentPullValue(), result',result);
			$rootScope.currLastPull = result;
			PitcherService.getCurrBaseline(pitcher).then(function(result){
				console.log('getCurrBaseline(), result',result);
				$rootScope.currBaseline = result;
			}).then(function(result){
				console.log('last step of choosePitcher(), about to redirect to home');
				$location.path('/home');
				// sidebar is closed by the ui-turn-off='uiSidebarRight' attrib in right_sidebar.html
			});
		});
	}

}

})(this);