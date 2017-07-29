(function(gScope){
	
angular.module(gScope.AppNameId)
.controller('homeController', ['$rootScope','$scope','$log', 'chartService', 'bluetoothService','AccountService','SharedState','$location','PitcherService','$timeout','PulldataService','$localStorage', init]);

function init($rootScope,$scope,$log,chartService,bluetoothService,AccountService,SharedState,$location,PitcherService,$timeout, PulldataService, $localStorage){

	$scope.pitcher = $rootScope.chosenPitcher;
	

	// PULL

	$scope.pullCounter = 1;
	$scope.acceptPull;
	$scope.doPull3 = false;
	$scope.donePulling = false;

	resetPullsObj();

	$scope.data = [];
	$scope.rawSensorData = [];

	$scope.currLastPull = $rootScope.currLastPull;
	$scope.currBaseline = $rootScope.currBaseline;

	// TODO these two may be duplicates, determine whether both are needed
	$scope.doingPull = false;
	$scope.streaming = false;

	/**
	 * CHARTING
	 */

	var DATA_PLOT_LIMIT = 50;
	var startTime;
	var targetChart = '#ct-chart';

	/**
	 * BLUETOOTH
	 */

	bluetoothService.getUnpaired();

	$scope.connected = false;
	$scope.connecting = false;

	$scope.connect = connect;
	$scope.disconnect = disconnect;

	/**
	 * PULL FUNCTIONS
	 */

	$scope.startPull = function(){

		console.log('in startPull()...');

		$scope.doingPull = true;
		$scope.streaming = true;

		// START GETTING DATA		
		startTime = new Date().getTime() / 1000;
		bluetoothService.start(100);

		// CREATE CHART
		chartService.makeChart(targetChart,null);
	}

	$scope.stopPull = function(){

		console.log('in stopPull()...');

		bluetoothService.stop();

		var tempMainValue = 0;
		
		$scope.currPulls[$scope.pullCounter].rawData = $scope.data;
		$scope.currPulls[$scope.pullCounter].rawSensorData = $scope.rawSensorData;

		console.log('in acceptOrReject(), $scope.dataToSave',$scope.data);
		$scope.data.map(function(e){
console.log('in $scope.data.map: e',e);
			if(e.y > tempMainValue){
console.log('updating tempMainValue',tempMainValue);
				tempMainValue = e.y;
			}
		});
console.log('tempMainValue',tempMainValue);
		$scope.currPulls[$scope.pullCounter].mainValue = tempMainValue;
		
		// GET ACCEPT OR REJECT FROM USER
		SharedState.turnOn('acceptPullModal');

	}

	$scope.acceptOrReject = function(choice){

		if(choice == 'accept'){
			
			if($scope.pullCounter == 1){

				$localStorage.currPulls = $scope.currPulls;
				$scope.pullCounter++;

			}
			else if($scope.pullCounter == 2){

				// check whether to do a pull 3
				if(twoPullsOk()){

					var data = {
						mainValue: $scope.currPulls.mainValue,
						note: '',
						pulls: $scope.currPulls,
						pitcher: $rootScope.chosenPitcher.id
					};
					PulldataService.save(data);
					
					$scope.currPulls.mainValue = ( $scope.currPulls['1'].mainValue + $scope.currPulls['2'].mainValue ) / 2;
					updateBaseline($scope.currPulls.mainValue);
					$scope.donePulling = true;
				
				}else{
				
					$localStorage.currPulls = $scope.currPulls;
					SharedState.turnOn('doThirdPullModal');
					$scope.pullCounter++;
				
				}
			
			}else if($scope.pullCounter == 3){

				// data is the $scope.currPulls object, convert to stamplay field
				var data = {
					mainValue: $scope.currPulls.mainValue,
					note: '',
					pulls: $scope.currPulls,
					pitcher: $rootScope.chosenPitcher.id
				};
				PulldataService.save(data);
				$scope.currPulls.mainValue = getAvgOfThreePulls();
				updateBaseline($scope.currPulls.mainValue);
				$scope.donePulling = true;
			
			}
		
		}
		
		// clear out the data to prepare for the next pull
		$scope.data = [];

		$scope.streaming = false;
		$scope.doingPull = false;

		SharedState.turnOff('acceptPullModal');

	}

	function twoPullsOk(){ // Math.pow(4, 3);
		console.log('in twoPullsOk()');
		var minimumDifference = 2; // in pounds
		
		// get difference of the first two pulls without negative numbers
		var diff = ($scope.currPulls['1'].mainValue - $scope.currPulls['2'].mainValue);
		diff = Math.pow(diff,2);
		diff = Math.sqrt(diff);
		
		if(diff <= minimumDifference)
			return true;
		else
			return false;
	}

	function getAvgOfThreePulls(){

		// get difference of pulls 1 & 2
		var diff1 = ($scope.currPulls['1'].mainValue - $scope.currPulls['2']);
		diff1 = Math.pow(diff1,2);
		diff1 = Math.sqrt(diff1);

		// get difference of pulls 2 & 3
		var diff2 = ($scope.currPulls['2'].mainValue - $scope.currPulls['3']);
		diff2 = Math.pow(diff2,2);
		diff2 = Math.sqrt(diff2);

		// get difference of pulls 1 & 3
		var diff3 = ($scope.currPulls['1'].mainValue - $scope.currPulls['3']);
		diff3 = Math.pow(diff3,2);
		diff3 = Math.sqrt(diff3);

		// pick the smallest difference, use that to determine average
		var choice = diff2 < diff1 ? 2 : (diff3 < diff1 ? 3 : 1);

		// get average of the two pulls with the least difference
		switch(choice){
			case 1:
				return ($scope.currPulls['1'].mainValue + $scope.currPulls['2']) / 2;
				break;
			case 2:
				return ($scope.currPulls['2'].mainValue + $scope.currPulls['3']) / 2;
				break;
			case 3: 
				return ($scope.currPulls['1'].mainValue + $scope.currPulls['3']) / 2;
				break;
		}

	}

	function resetPullsObj(){
		$scope.currPulls = {
			'1': {
				mainValue: 0,
				rawData: [],
				rawSensorData: []
			},
			'2': {
				mainValue: 0,
				rawData: [],
				rawSensorData: []
			},
			'3': {
				mainValue: 0,
				rawData: [],
				rawSensorData: []
			},
			mainValue: 0
		};
	}

	$scope.acceptModalCreateChart = function(){
		console.log('in acceptModalCreateChart()...');
		var target = '#ct-chart-final';
		var options = {
  			height: '300px',
  			axisX: {
	            type: Chartist.AutoScaleAxis,
	            onlyInteger: true,
	        }
	 	};
		chartService.makeChart(target,null,options);
		chartService.setData(target, $scope.data);
	}

	function updateBaseline(value){
		if($rootScope.currBaseline == 0)
			$rootScope.currBaseline = $scope.currPulls.mainValue;
		// save in database
		PitcherService.updateCurrBaseline(pitcher,value).then(function(result){
console.log('updated baseline in Pitcher data obj in Stamplay: result',result);
		});
	}

	/**
	 * BLUETOOTH CONNECTION FUNCTIONS
	 */

	function connect(){
		console.log('connecting...');
		if($scope.chosenPitcher.name == ''){
			// need to choose a pitcher first
			SharedState.turnOn('choosePitcher');
			return false;
		}
		$scope.connecting = true;
		$rootScope.loadingOverlayText = 'CONNECTING';
		SharedState.turnOn('loadingOverlay');
		bluetoothService.connect().then(
			function(data){
				console.log(data);
				$scope.connected = true;
				$scope.connecting = false;
				$rootScope.connected = true;
				SharedState.turnOff('loadingOverlay');
				bluetoothService.subscribe(dataHandler);
			}, function(err){
				SharedState.turnOff('loadingOverlay');
				console.log('ERROR CONNECTING BLUETOOTH: ',err);
				$scope.connected = false;
				$scope.connecting = false;
				$rootScope.connected = false;
				SharedState.turnOn('bluetoothNotConnecting');
			}
		);		
	}

	$scope.areYouDone = function(done){
		console.log('in areYouDone(), done',done);
		if(done){
			$scope.donePulling = true;
			disconnect();
		}
		SharedState.turnOff('areYouDoneModal');
	}

	function disconnect(){

		if(!$scope.donePulling){
			console.log('in disconnect(), not done, showing modal');
			SharedState.turnOn('areYouDoneModal');
			return false;
		}

		resetPullsObj();
		
		$scope.pullCounter = 1;

		$rootScope.chosenPitcher = {
			name: ''
		};

		$scope.connecting = false;
		$scope.connected = false;
		$rootScope.connected = false;
		
		bluetoothService.disconnect();
	}

	function dataHandler(dataPoint){
console.log('dataPoint',dataPoint);
		var temp = dataPoint.split('|');
		var reading = parseFloat(temp[1].toString());
		var load = parseFloat(temp[3].toString());
console.log('reading',reading,'load',load);

		var r = {};
        r.x = new Date().getTime() / 1000 - startTime;
        r.y = load;
    	
    	$scope.data.push(r);
    	$scope.rawSensorData.push(dataPoint);
    	
    	plot();
	}

	function plot(){
		 if($scope.data.length > DATA_PLOT_LIMIT){
            chartService.setData(targetChart, $scope.data.slice($scope.data.length-DATA_PLOT_LIMIT,$scope.data.length));
        } else chartService.setData(targetChart, $scope.data);
	}

}


})(this);