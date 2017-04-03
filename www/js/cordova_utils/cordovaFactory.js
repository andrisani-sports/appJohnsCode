//this module passes Cordova events from document to the angular app.

(function(gScope){
	angular.module(gScope.AppNameId)
		.factory('fhsCordova', ['$log', '$rootScope', initialize]);


function initialize($log, $rootScope){

	/**
     * set up environment variables
     */
	
	var RESUME  = 'CORDOVA_RESUME';
	var PAUSE   = 'CORDOVA_PAUSE';
	var ONLINE  = 'CORDOVA_ONLINE';
	var OFFLINE = 'CORDOVA_OFFLINE';

	var service = {};

	/**
	 * Check to see if Cordova is running (i.e. we're running in mobile device)
	 */
	
	var ready   = window.cordova !== undefined;

	if(ready) { // RUNNING ON MOBILE DEVICE
		$log.debug('Cordova Ready');
		service.platform = device.platform;
     	document.addEventListener("backbutton", backKeyDown, false);
 	}else{ // RUNNING ON SOMETHING ELSE (PROBABLY BROWSER)
    	$log.debug('Cordova not Ready');
    	window.addEventListener('popstate', backKeyDown, false);
    }

	/**
	 * Event Listeners needed by Angular (events originate with Cordova)
	 */
  	
  	document.addEventListener("resume", onResume, false);
	document.addEventListener("pause", onPause, false);

	document.addEventListener("offline", onOffline, false);
	document.addEventListener("online", onOnline, false);
	
	if(ready) { // add event listener based on whether app is running on device or in a local browser
     	document.addEventListener("backbutton", backKeyDown, false);
 	}else{ 
    	window.addEventListener('popstate', backKeyDown, false);
    }

	/**
	 * SET UP SERVICE METHODS
	 */

	service.ready = ready;
	service.RESUME = RESUME;
	service.PAUSE = PAUSE;
	service.ONLINE = ONLINE;
	service.OFFLINE = OFFLINE;
	service.checkOnlineStatus = checkOnline;

	return service;

    /**
     * HELPER FUNCTIONS
     * They retransmit a browser (Cordova event) through Angular's $rootScope
     * which is caught in AppController (see the $scope.$on() functions there)
     */
	
	function onResume(){
		$log.debug('resuming the app');
		$rootScope.$broadcast(RESUME);
	}

	function onPause(){
		$log.debug('pausing the app');
		$rootScope.$broadcast(PAUSE);
	}

    function backKeyDown(e){
		e.preventDefault();
		$rootScope.$broadcast('backButton');
    }

	function onOffline() {
	    // Handle the offline event
	    console.log('fhsCordova offline');
	    $rootScope.$broadcast(OFFLINE);
	}

	function onOnline() {
		console.log('fhsCordova online');
	    // Handle the online event
	    var networkState = navigator.connection.type;
	    
	    if (networkState !== Connection.NONE) {
	        // connected to Internet
	        $rootScope.$broadcast(ONLINE,'Connection type: ' + networkState);
	    }else{
	    	// still not online
	    	$rootScope.$broadcast(OFFLINE);
	    }
	
	}

	function checkOnline(){
		console.log('fhsCordova, checking for online status');
	    
	    // Handle the online event
	    var networkState = navigator.connection.type;
	    
	    if (networkState !== Connection.NONE) {
	        // online
	        $rootScope.$broadcast(ONLINE,'Connection type: ' + networkState);
	    }else{
	    	// not online
	    	$rootScope.$broadcast(OFFLINE);
	    }
	}

}

})(this);