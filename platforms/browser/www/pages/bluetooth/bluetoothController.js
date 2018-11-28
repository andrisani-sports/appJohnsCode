(function(gScope){
	
	angular.module(gScope.AppNameId)
	.controller('bluetoothController', ['$rootScope','$scope','$log','bluetoothService',init]);

	function init($rootScope,$scope,$log,bluetoothService){

		$scope.chooseBluetooth = function(device){
			// example: [{ "class": 276, "id": "10:BF:48:CB:00:00", "address": "10:BF:48:CB:00:00", "name": "Nexus 7" }]
			bluetoothService.setBluetoothClient(device);
			SharedState.turnOff('chooseBluetoothClient');
		}

		$scope.getBluetoothList = function() {
			$rootScope.loadingOverlayText = 'LOADING';
			SharedState.turnOn('loadingOverlay');
			bluetoothService.getUnpaired()
			.then(function(devices){
				$scope.bluetoothDevices = devices;
				SharedState.turnOff('loadingOverlay');
			});
		}

	}

})