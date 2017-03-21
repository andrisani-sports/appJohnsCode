(function(gScope){

angular.module(gScope.AppNameId)
.controller('AppController', ['$log', '$scope','fhsCordova','$rootScope', function($log, $scope, fhsCordova, $rootScope){
		var app = this;

		$rootScope.chosenPitcher = {
			name: ''
		};

 		$scope.$on(fhsCordova.RESUME, resume);
		$scope.$on(fhsCordova.PAUSE, pause);
 		
 		function pause(event){
 			$log.debug("AppController: pause");
 		}

 		function resume(event){
 			$log.debug("AppController: resume");
 		}


	}]);


})(this);
