(function (gScope) {

angular.module(gScope.AppNameId)
	.controller('splashController', ['$location', '$timeout', init]);


function init($location, $timeout){
	
	$timeout(function(){
			//this redirects to the home page after the splash is displayed	  
	 		$location.path('/home');
	  },3000);

}

})(this);