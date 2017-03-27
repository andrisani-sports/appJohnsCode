(function(gScope){
	
angular.module(gScope.AppNameId)
.controller('homeController', ['$rootScope','$scope','$log', 'chartService', 'bluetoothService','AccountService','SharedState','$location','PitcherService','$timeout', init]);

function init($rootScope,$scope,$log,chartService,bluetoothService,AccountService,SharedState,$location,PitcherService,$timeout){

	$scope.pitcher = $rootScope.chosenPitcher;
	
	$scope.currPull = {
		pull1: {
			mainValue: 0
		},
		pull2: {
			mainValue: 0
		},
		pull3: {
			mainValue: 0
		}
	}

	$scope.currLastPull = $rootScope.currLastPull;
	$scope.currBaseline = $rootScope.currBaseline;

	/**
	 * CHARTING VALUES
	 */

	var DATA_PLOT_LIMIT = 50;
	var startTime;
	var targetChart = '#ct-chart';

	// chartService.makeChart(targetChart,null);

	/**
	 * BLUETOOTH VALUES
	 */

	console.log('bluetoothService?', bluetoothService);

	$scope.connected = false;
	$scope.connecting = false;

	$scope.connect = connect;
	$scope.disconnect = disconnect;

	$scope.streaming = false;
	$scope.start = start;
	$scope.stop = stop;

	/**
	 * PULL VALUES
	 */

	$scope.needAnotherPull = false;

	$scope.doPull = function(iteration){

		var done = false;
		var timer = 0;
		var threshhold = 0;
		var passedThreshhold = false;

		// show modal
		SharedState.turnOn('doingPullModal');

		// START GETTING DATA
		start();
		
		///////////////////////////////////////////////////////
		while(!done){

			// wait until there is more then threshhold noise in sensor
			if(threshhold > 0){
				passedThreshhold = true;
			}
			
			// get data for 2 seconds after threshhold is reached
			if(passedThreshhold){
				startGettingData();
				$timeout(function(){
					done = true;
				},2000);
			}
		}
		///////////////////////////////////////////////////////
		
		stop();

		if(iteration == 2){
			// check to see if a 3rd pull is needed
			// ????????
		}
	}

	$scope.stopPull = function(){
		SharedState.turnOff('doingPullModal');
	}

	/**
	 * HELPER FUNCTIONS
	 */
	
	function startGettingData(){
// TODO
	}

	function connect(){
		if($scope.chosenPitcher.name == ''){
			// need to choose a pitcher first
			SharedState.turnOn('choosePitcher');
			return false;
		}
		$scope.connecting = true;
		bluetoothService.connect().then(
			function(data){
				console.log(data);
				$scope.connected = true;
				$scope.connecting = false;
				bluetoothService.subscribe(dataHandler);
				$location.path('/pull');
			}, function(err){
				console.log('ERROR CONNECTING BLUETOOTH: ',err);
				$scope.connected = false;
				$scope.connecting = false;
			}
		);		
	}

	function disconnect(){
		$scope.connecting = false;
		$scope.connected = false;
		bluetoothService.disconnect();
	}

	function start(){
		$scope.streaming = true;
		startTime = new Date().getTime() / 1000;
		bluetoothService.start(100);
	}

	function stop(){
		$scope.streaming = false;
		bluetoothService.stop();
	}

	function dataHandler(dataPoint){
		var r = {};
        r.x = new Date().getTime() / 1000 - startTime;
        r.y = dataPoint.volt;
        $scope.data.push(r);
        plot();
	}

	function plot(){
		 if($scope.data.length > DATA_PLOT_LIMIT){
            chartService.setData(targetChart, $scope.data.slice($scope.data.length-DATA_PLOT_LIMIT,$scope.data.length));
        } else chartService.setData(targetChart, $scope.data);
	}

}


})(this);