//this module is used to bootstrap angular after cordova has loaded.


(function(gScope){

 document.addEventListener('DOMContentLoaded', function(){ 
        init();
    }, false);

	var init = function(){
            var onDeviceReady = function(){
                loadPage('cordova');
            };

            var loadPage = function(type){
                console.log('ready');
                gScope.deviceType = type;
              	angular.bootstrap(document.body,[gScope.AppNameId]);
            };

            this.bindEvents = function(){
                document.addEventListener('deviceready',onDeviceReady,false);
            };

            if(window.cordova !== undefined){
                console.log('cordova detected, waiting for device to be ready');
                this.bindEvents();
            } else {
                console.log('no cordova present');
                loadPage('browser');
            }
	}

})(this);