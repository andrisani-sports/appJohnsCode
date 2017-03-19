(function(gScope){
	
angular.module(gScope.AppNameId)
	.controller('homeController', ['$scope','$log', 'chartService', 'bluetoothService', init]);


function init($scope,$log,chartService,bluetoothService){
	var DATA_PLOT_LIMIT = 50;
	var startTime;
	var targetChart = '#ct-chart';

	chartService.makeChart(targetChart,null);
	console.log(bluetoothService);
	$scope.connected = false;
	$scope.connecting = false;
	$scope.connect = connect;
	$scope.disconnect = disconnect;

	$scope.streaming = false;
	$scope.start = start;
	$scope.stop = stop;

	$scope.data = [];

	function connect(){
		$scope.connecting = true;
		bluetoothService.connect().then(function(data){
				console.log(data);
				$scope.connected = true;
				$scope.connecting = false;
				bluetoothService.subscribe(dataHandler);
		}, function(err){
				console.log(err);
				$scope.connected = false;
				$scope.connecting = false;
		});		
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