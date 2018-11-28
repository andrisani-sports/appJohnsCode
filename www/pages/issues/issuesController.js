(function(gScope){
	
angular.module(gScope.AppNameId)
	.controller('issuesController', ['$scope', '$rootScope', '$log', '$location', 'chartService', 'IssueService', init]);


function init($scope,$rootScope,$log,$location,chartService,IssueService){

	// send issue
	$scope.sendIssue = function(issue) {
		IssueService.sendIssue(issue).then(function(result){
			$rootScope.Ui.turnOff('modal2');
		});
	}

}

})(this);