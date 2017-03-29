//this module passes Cordova events from document to the angular app.

(function(gScope){
	angular.module(gScope.AppNameId)
		.factory('fhsCordova', ['$log', '$rootScope', initialize]);


function initialize($log, $rootScope){

  	document.addEventListener("resume", onResume, false);
	document.addEventListener("pause", onPause, false);

    // rebroadcast into angular:
    function backKeyDown(e){
		e.preventDefault();
		console.log('broadcasting back');
		$rootScope.$broadcast('backButton');
    }

	var RESUME  = 'CORDOVA_RESUME';
	var PAUSE   = 'CORDOVA_PAUSE';
	var ONLINE  = 'CORDOVA_ONLINE';
	var ready   = window.cordova !== undefined;

	var service = {};
	service.ready = ready;
	service.RESUME = RESUME;
	service.PAUSE = PAUSE;

	if(ready) { // RUNNING ON MOBILE DEVICE
		service.platform = device.platform;
     	document.addEventListener("backbutton", backKeyDown, false);
 	}else{ // RUNNING ON SOMETHING ELSE (PROBABLY BROWSER)
    	window.addEventListener('popstate', backKeyDown, false);
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

}

})(this);