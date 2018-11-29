(function(gScope){
	
	angular.module(gScope.AppNameId)
	.controller('bluetoothController', ['$rootScope','$scope','$log','bluetoothService','SharedState',init]);

	function init($rootScope,$scope,$log,bluetoothService,SharedState){

		console.log('BLUETOOTH CONTROLLER init');

		$scope.bluetoothDevices = [];

		$scope.chooseBluetooth = function(device){
			// example: [{ "class": 276, "id": "10:BF:48:CB:00:00", "address": "10:BF:48:CB:00:00", "name": "Nexus 7" }]
			bluetoothService.setBluetoothClient(device);
			console.log('connecting to bluetooth...');
			$scope.connecting = true;
			$rootScope.loadingOverlayText = 'CONNECTING';
			SharedState.turnOn('loadingOverlay');
			bluetoothService.connect().then(
				function(data){
					console.log(data);
					$scope.connected = true;
					$scope.connecting = false;
					$rootScope.bluetoothConnected = true;
					SharedState.turnOff('loadingOverlay');
					bluetoothService.subscribe(dataHandler);
				}, function(err){
					SharedState.turnOff('loadingOverlay');
					console.log('ERROR CONNECTING BLUETOOTH: ',err);
					$scope.connected = false;
					$scope.connecting = false;
					$rootScope.bluetoothConnected = false;
					SharedState.turnOn('bluetoothNotConnecting');
				}
			);
		}

		$scope.getBluetoothList = function() {
			$rootScope.loadingOverlayText = 'LOADING -- May take up to 30 seconds...';
			SharedState.turnOn('loadingOverlay');
			bluetoothService.getUnpaired()
			.then(function(devices){
				$scope.bluetoothDevices = devices;
				SharedState.turnOff('loadingOverlay');
			});
		}

	}

})(this);