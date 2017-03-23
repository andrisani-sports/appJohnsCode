(function(gScope){
	
angular.module(gScope.AppNameId)
.controller('homeController', ['$scope','$log', 'chartService', 'bluetoothService','AccountService', init]);

function init($scope,$log,chartService,bluetoothService,AccountService){

	console.log(bluetoothService);
	$scope.connected = false;
	$scope.connecting = false;
	$scope.connect = connect;
	$scope.disconnect = disconnect;

	$scope.streaming = false;
	$scope.start = start;
	$scope.stop = stop;

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

}


})(this);