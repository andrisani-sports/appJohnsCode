(function(gScope){

angular
.module(gScope.AppNameId)
.controller('AppController', ['$log', '$scope','fhsCordova','$rootScope', 'SharedState', 'AccountService', '$localStorage',
function($log, $scope, fhsCordova, $rootScope, SharedState, AccountService, $localStorage){

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

	/**
	 * INITIALIZE MODALS
	 */

	SharedState.initialize($scope, 'modal1');
    SharedState.initialize($scope, 'modal2');
    SharedState.initialize($scope, 'choosePitcher');
    SharedState.initialize($scope, 'uiSidebarLeft');
    SharedState.initialize($scope, 'uiSidebarRight');
    SharedState.initialize($scope, 'doingPullModal');

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
	
	$scope.$on(fhsCordova.OFFLINE, online);
	$scope.$on(fhsCordova.ONLINE, offline);

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
			$log.debug('AppController: offline',event);
			$rootScope.online = false;
		}

		function online(event){
			$log.debug('AppController: online',event);
			$rootScope.online = true;
		}


}]);


})(this);
