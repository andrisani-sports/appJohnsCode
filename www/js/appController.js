(function(gScope){

angular.module(gScope.AppNameId)
.controller('AppController', ['$log', '$scope','fhsCordova','$rootScope', 'SharedState', function($log, $scope, fhsCordova, $rootScope, SharedState){
		var app = this;

		$rootScope.chosenPitcher = {
			name: ''
		};

		SharedState.initialize($scope, 'modal1');
    SharedState.initialize($scope, 'modal2');

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
