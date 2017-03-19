//this module passes Cordova events from document to the angular app.

(function(gScope){
	angular.module(gScope.AppNameId)
		.factory('fhsCordova', ['$log', '$rootScope', initialize]);


function initialize($log, $rootScope){
	  	document.addEventListener("resume", onResume, false);
  		document.addEventListener("pause", onPause, false);
  		document.addEventListener("online", onOnline, false);

  		var RESUME = 'CORDOVA_RESUME';
  		var PAUSE = 'CORDOVA_PAUSE';
  		var ONLINE = 'CORDOVA_ONLINE';
  		var ready = window.cordova !== undefined;

  		var service = {};
  		service.ready = ready;
  		service.RESUME = RESUME;
  		service.PAUSE = PAUSE;
  		if(ready) {
 			service.platform = device.platform;
 		}

  		if(ready) $log.debug('Cordova Ready');
  		else $log.debug('Cordova not Ready');

  		return service;
		function onResume(){
			$log.debug('resuming the app');
			$rootScope.$broadcast(RESUME);
		}
		function onPause(){
			$log.debug('pausing the app');
			$rootScope.$broadcast(PAUSE);
		}
		function onOnline(){
			$log.debug('Network Detected by Cordova');
			$rootScope.$broadcast(ONLINE);
		}
}

})(this);