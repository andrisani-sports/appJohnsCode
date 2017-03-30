(function(gScope){

angular.module(gScope.AppNameId)
.factory('dataFactory', ['$rootScope', '$log', '$localStorage', '$q', init]);

function init($rootScope, $log, $localStorage, $q){
	
	// NOTE: use (return) promises!

	// PROCESS FOR WRITE
	// 1. get data to be written and save to localStorage
	// 2. check if Internet connection available
	// 3. if Yes, save to cloud, then mark as pushed in localStorage
	// 4. check to see if close to limit, and if so, clear old pull data

	// PROCESS FOR READ
	// 1. Check to see if data exists in localStorage
	// 2. if Yes, set to return variable, but don't return to $scope yet
	// 3. check if Internet is available
	// 4. if Yes, check for updated data from Stamplay
	// 5. compare new data with local data
	// 6. if new data is better then local data, store in localS, then return to $scope

	// Service Methods WRITE: user.login(), obj.update(), obj.save() [new or update]
	// Service Methods READ: user.currentUser(), obj.get()

	var returnData;
	var $stamplay = $angular.copy(Stamplay);

	var service = {};

	service.user = {
		current: currentUser,
		login: login
	}; 
	
	service.obj = {
		get: getObj,
		update: updateObj,
		save: saveObj
	}; 

	return service;

	/**
	 * USER FUNCTIONS
	 */

	function login(user){
		// NOTE: user.email & user.password
		// PROCESS FOR WRITE
		// 1. get data to be written and save to localStorage
		// 2. check if Internet connection available
		if($rootScope.online){

		}
		// 3. if Yes, save to cloud, then mark as pushed in localStorage
		// 4. check to see if close to limit, and if so, clear old pull data
		
	}

	function currentUser(){
		// PROCESS FOR READ
		// 1. Check to see if data exists in localStorage
		// 2. if Yes, set to return variable, but don't return to $scope yet
		// 3. check if Internet is available
		if($rootScope.online){
			
		}
		// 4. if Yes, check for updated data from Stamplay
		// 5. compare new data with local data
		// 6. if new data is better then local data, store in localS, then return to $scope

		return this;
	}

	/**
	 * OBJECT FUNCTIONS
	 */

	 function getObj(objName,query){ // PROCESS FOR READ
		var p = $q.defer();

		// 1. Check to see if data exists in localStorage
		var localData = queryLocal(objName,query);

		// 2. if Yes, set to return variable, but don't return to $scope yet
		if(localData){
			returnData = angular.copy(localData);
		}

		// 3. check if Internet is available
		if($rootScope.online){
			// 4. if Yes, check for updated data from Stamplay
			Stamplay.Object(objName).get(query)
			.then(function(response) {
				// 5. compare new data with local data
				// if(dt_modify in Stamplay is more recent then dt_update in localStorage)

				// if hash 

				// 6. if new data is better then local data, store in localS, then return to $scope
				p.resolve(response.data);
			}, function(err) {
				p.reject(new Error('no data found'));
			})
		
		}else{
			p.resolve(returnData);
		}
		
		return p;

	 }

	 function saveObj(objName,data){ // PROCESS FOR WRITE
		
		// sanitize
		for(var field in data){
			if(typeof data[field] == 'number'){

			}else{
				data[field] = _sanitizeString(data[field]);
			}
		}

		// 1. get data to be written and save to localStorage
		// Scenarios: 
		// a. data is array of objects, and some already exist in localStorage
		// b. localStorage[objName] is append-only (i.e. pull data)
		if(typeof data == 'object' && data.length > 1){

		}else{
			$localStorage[objName] = data;
		}

		// 2. check if Internet connection available
		if($rootScope.online){
			
		}
		// 3. if Yes, save to cloud, then mark as pushed in localStorage
		
		// 4. check to see if close to limit, and if so, clear old pull data

	 }

	/**
	 * HELPER (INTERNAL) FUNCTIONS
	 */
	
	// http://stackoverflow.com/questions/23187013/is-there-a-better-way-to-sanitize-input-with-javascript
	function _sanitizeString(str){
	    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
	    return str.trim();
	}

	function _queryLocal(objName,query){

	 	// if query is a string and empty, return false (for error)
	 	// TODO make this return a new Error and add error handling above
	 	if((typeof query == 'string' && query == ''))
	 		return false;

	 	// if that object doesn't exist in localStorage (i.e. 'pitchers' or 'pulls')
	 	if(!$localStorage[objName])
	 		return false;

	 	// if empty query & query is object, then return all instances of 'objName'
	 	if(typeof query == 'object' && !Object.keys(query).length) {
	 		return $localStorage[objName];
	 	}

	 	// query is: {'team':team} or { _id : id} or something similar
	 	var dataForReturn = [];
	 	var tempDataList = $localStorage[objName];
	 	for(var obj in tempDataList){
	 		var returnStatus = false;
	 		for(var field in query){
	 			if(obj[field] && obj[field] == query[field])
	 				returnStatus = true;
	 		}
	 		if(returnStatus)
	 			dataForReturn.push(obj);
	 	}
	 	return dataForReturn;

	}
}

})(this);