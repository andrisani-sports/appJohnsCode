(function(gScope){

angular
.module(gScope.AppNameId)
.controller('AppController', ['$log', '$scope','fhsCordova','$rootScope', 'SharedState', 'AccountService', '$localStorage', 'dataService',
function($log, $scope, fhsCordova, $rootScope, SharedState, AccountService, $localStorage, dataService){

	console.log('====STARTING APP CONTROLLER====');

	/**
	 * SETUP VARIABLES FOR TEMPLATES
	 */

	var app = this;

	$rootScope.chosenPitcher = {
		name: ''
	};
	$rootScope.pitchers = [];
	$rootScope.currLastPull;
	$rootScope.currBaseline;
	$rootScope.online = false;
	$rootScope.connected = false; // for Bluetooth connection
	$rootScope.loadingOverlayText = '';
	$rootScope.loginError = '';

	/**
	 * INITIALIZE MODALS
	 */

	SharedState.initialize($scope, 'modal1');
    SharedState.initialize($scope, 'modal2');
    SharedState.initialize($scope, 'choosePitcher');
    SharedState.initialize($scope, 'uiSidebarLeft');
    SharedState.initialize($scope, 'uiSidebarRight');
    SharedState.initialize($scope, 'doingPullModal');
    SharedState.initialize($scope, 'acceptPullModal');
    SharedState.initialize($scope, 'areYouDoneModal');
    SharedState.initialize($scope, 'loadingOverlay');
    SharedState.initialize($scope, 'bluetoothNotConnecting');
	SharedState.initialize($scope, 'savingData');

    /**
     * FUNCTIONS FOR TEMPLATES
     */

    $scope.testBtn = function(){
		console.log('test button worked');
	}

	$rootScope.logout = AccountService.logout;

    /**
     * HANDLE EVENTS 
     */

	$scope.$on(fhsCordova.RESUME, resume);
	$scope.$on(fhsCordova.PAUSE, pause);
	
	$scope.$on('backButton', back);

	$scope.$on(fhsCordova.OFFLINE, offline);
	$scope.$on(fhsCordova.ONLINE, online);

	$rootScope.$on('savingData', savingData);
	$rootScope.$on('doneSavingData', doneSavingData);

	/**
     * CHECK TO SEE IF DEVICE ONLINE OR NOT
     * this kicks off the event consumed by the $on above, so must
     * be placed after the HANDLE EVENTS section above
     */

    fhsCordova.checkOnlineStatus();


	/**
	 * HELPER FUNCTIONS
	 */

	function back(){

		console.log('back pressed');

		// OPTION 1
		// if($location.path() == '/registration' && fhs.isEmpty($location.search()) ) navigator.app.exitApp();
		// window.history.back();

		// OPTION 2
		// console.log('back pressed');
		// if($location.path() == '/home' || $location.path() == '/locked') navigator.app.exitApp();
		// else {
		// 	if(document.getElementsByTagName("md-bottom-sheet").length > 0) {
		// 		console.log('bottom sheet detected');
		// 		$mdBottomSheet.cancel();
		// 		}
		// 	else {
		// 		console.log('bottom sheet NOT detected');
		// 		//window.history.back(); 
		// 		$timeout(function(){
		// 			var target = history.pop();
		// 			target = history.pop();
		// 			if(target)	$location.path(target).replace();
		// 			else $location.path('/home').replace();
		// 		},1);
		// 	 }
		// }
		
	}

	function pause(event){
		$log.debug("AppController: pause");
	}

	function resume(event){
		$log.debug("AppController: resume");
	}

	function offline(event){
		$log.debug('AppController: offline',event,$rootScope);
		if(!$scope.$$phase) {
			$scope.$apply(function(){
				$rootScope.online = false;
			});
		}else{
			$rootScope.online = false;
		}
	}

	function online(event){
		$log.debug('AppController: online',event,$rootScope);
		if(!$scope.$$phase) {
			$scope.$apply(function(){
				$rootScope.online = true;
			});
		}else{
			$rootScope.online = true;

			// PUSH PENDING DATA
			dataService.pushPendingToCloud();

		}
	}

	function savingData(event){
		$log.debug('saving data, turning on overlay');
		console.log('saving data ---- overlay ON');
		SharedState.turnOn('savingData');
	}

	function doneSavingData(event){
		$log.debug('done saving data, turning off overlay');
		console.log('done saving data ---- overlay OFF');
		SharedState.turnOff('savingData');
	}


}]);


})(this);
