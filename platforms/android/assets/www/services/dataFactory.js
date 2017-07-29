(function(gScope){

angular.module(gScope.AppNameId)
.factory('dataService', ['$rootScope', '$log', '$localStorage', '$q', init]);

function init($rootScope, $log, $localStorage, $q){

	/**
	 * INSTANTIATE PARAMS
	 */

	if(!$localStorage.temp)
		$localStorage.temp = {};
	if(!$localStorage.perm)
		$localStorage.perm = {};

	var returnData;

	/**
	 * CLOUD PARAMETERS
	 */

	var $stamplay = angular.copy(Stamplay);

	/**
	 * SERVICE
	 */

	// NOTE: use (return) promises!

	// PROCESS FOR WRITE
	// 1. get data to be written and save to localStorage
	// 2. check if Internet connection available
	// 3. if Yes, 
	// 		create a local hash using timestamp and values for each data element
	// 		save to cloud
	// 		mark as 'pushedToCloud' in localStorage
	// 		do a get on the local_hash field in stamplay
	// 		if a record exists, mark as 'verified' in localStorage
	// 4. check to see if close to limit, and if so, clear old pull data

	// PROCESS FOR READ
	// 1. Check to see if data exists in localStorage
	// 2. if Yes, set to return variable, but don't return to $scope yet
	// 3. check if Internet is available
	// 4. if Yes, check for updated data from Stamplay
	// 5. compare new data with local data
	// 6. if new data is better then local data, store in localS, then return to $scope

	var service = {};

	service.currentUser = currentUser;
	service.login = login; 
	service.getObj = getObj;
	service.saveObj = saveObj;
	service.pushPendingToCloud = pushPendingToCloud;

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
	 * GET
	 */

	function getObj(objName,query){ // PROCESS FOR READ
		var p = $q.defer();

		console.log('DATASERVICE -> getObj(), query: ',query,' objName: ',objName);
		
		// 1. Check to see if data exists in localStorage
		
		try{
			var localData = _queryLocal('perm',objName,query);
			if(localData instanceof Error){
				console.log('NON-FATAL ERROR: ',localData);
				localData = false;
			}
			console.log('DATASERVICE -> getObj(), localData, ',localData);
		}catch(e){
			console.log('Error in getObj:',e);
			localData = false;
		}

		// 2. if Yes, set to return variable, but don't return to $scope yet
		// NOTE: returnData could be false, if no data found locally, but it 
		// doesn't matter as it is a valid value to send back to the service, 
		// and will be resolved below
		
		returnData = angular.copy(localData);
		console.log('DATASERVICE -> returnData',typeof returnData,returnData);

		// 3. check if Internet is available
		
		if($rootScope.online){
		
		// 4. if Yes, check for updated data from Stamplay
		
			Stamplay.Object(objName).get(query)
			.then(function(response) {
				if(response.data)
					response = response.data;
				console.log('DATASERVICE -> getObj(), Stamplay response',response);
		// 5. compare new data with local data if nothing in localStorage
				
				if(returnData == false){
					console.log('DATASERVICE -> getObj(), return == false // adding result to returnData and saving to local perm');
					returnData = response;
					_saveToLocalPerm(objName,response,true);
				}else{
					console.log('DATASERVICE -> getObj(), return == true // going through result line by line to add to perm');
					// go through each record from Stamplay
					var i; // for()
					var j; // for()
					var c; // the current response record
					var l; // the corresponding localStorage record
					var found; // flag - whether a match or not

					for(i=0; i <= response.length; i++){
						found = false;
						c = response[i];
					// find the corresponding record in localStorage.perm with _id
						l = _findInLocal('perm',c._id);

// WHAT IF THE RESULT FROM STAMPLAY IS A NEWER (DIFFERENT) RECORD THEN WHAT'S IN
// LOCALSTORAGE.PERM??
						if(!l){
							// if any Stamplay records left over, add to localStorage.perm
							// cause they would have originated off-device (admin panel)
							_saveToLocalPerm(objName,c,false);
							returnData.push(c);
						}else{
							returnData.push(l);
						}
					}
					// check for records in localStorage.temp, append to returnData
					if($localStorage.temp[objName].length > 0){
						$localStorage.temp[objName].map(function(e){
							returnData.push(e);
						});
					}
				}

			 // ---------------------------
			 	console.log('about to resolve from DATASERVICE!',returnData);
				p.resolve(returnData);
			 // ---------------------------

			}, function(err) {
				p.reject(new Error('no data found'));
			})
		} // end if($rootScope.online)
		else{
			p.resolve(returnData);
		}
		
		return p.promise;

	 }

	/**
	 * SAVE
	 */

	function saveObj(objName,tempData){ // PROCESS FOR WRITE
		
		var data = [];
		if(!$localStorage.temp[objName])
			$localStorage.temp[objName] = [];
		if(!$localStorage.perm[objName])
			$localStorage.perm[objName] = [];

		// convert data to array if its not
		if( Object.prototype.toString.call( tempData ) !== '[object Array]' ) {
		    data.push(tempData);
		}else{
			data = tempData;
		}

		// 1. get data to be written and save to $localStorage.temp
		// 		add a hash for identification
		// 		add a timestamp to help with uniqueness
		// 		attempt to save to Stamplay (with hash)

		var promiseArray = [];

		for(var i=0; i < data.length; i++){
			// sanitize
			for(var field in data[i]){
				if(typeof data[i][field] == 'string'){
					data[i][field] = _sanitizeString(data[i][field]);
				}
			}
			console.log('DATASERVICE -> saveObj(), post sanitize step');

			// add timestamp
			data[i].locTimestamp = new Date();
			// add a hash
			var tempHash = _hashString(JSON.stringify(data[i]));
			data[i].hash = tempHash.toString();
			// this timestamp won't get saved to cloud, so get rid of it
			delete data[i].locTimestamp;
			
			// save to localStorage.temp
			$localStorage.temp[objName].push(data[i]);
			console.log('DATASERVICE -> saveObj(), pushed to localStorage.temp');
			
			// check if Internet connection available
			if($rootScope.online){
				// save to Stamplay, add promise to array
				promiseArray.push(Stamplay.Object(objName).save(data[i]));
			}
			
			console.log('DATASERVICE -> saveObj(), array of promises to Stamplay, length',promiseArray.length);

		}

		// saves could fail if Internet dies out mid-save, so it is possible 
		// that array could be empty if all attempts fail
		if(promiseArray.length > 0){ 
			$q.all(promiseArray).then(function(result){
				console.log('DATASERVICE -> saveObj(), in $q.all');
				var record;
				var i;
				var j;
				for(i in result){
					// each result should be a record in localStorage.temp
					// so find that record, and move it to localStorage.perm
					$localStorage.perm[objName].push(result[i]);
					for(j in $localStorage.temp[objName]){
						record = $localStorage.temp[objName][j];
						if(record.hash === result[i].hash){
							delete $localStorage.temp[objName][j];
						}
					}
				}
			});
		}
		console.log('DATASERVICE -> saveObj(), FINISHED');
	}

	/**
	 * 
	 */
	
	 function pushPendingToCloud(){
return; 	
	 	var pending = $localStorage.temp;
	 	var promiseArray = [];

	 	for(objName in pending){
	 		// check if Internet connection available
			if($rootScope.online){
				// save to Stamplay, add promise to array
				promiseArray.push(Stamplay.Object(objName).save(data[i]));
			}
	 	}

	 	if(promiseArray.length > 0){ 
			$q.all(promiseArray).then(function(result){
				var record;
				var i;
				var j;
				for(i in result){
					// each result should be a record in localStorage.temp
					// so find that record, and move it to localStorage.perm
					$localStorage.perm[objName].push(result[i]);
					for(j in $localStorage.temp[objName]){
						record = $localStorage.temp[objName][j];
						if(record.hash === result[i].hash){
							delete $localStorage.temp[objName][j];
						}
					}
				}
			});
		}

	 }


	/**
	 * HELPER (INTERNAL) FUNCTIONS
	 */

	// http://stackoverflow.com/questions/23187013/is-there-a-better-way-to-sanitize-input-with-javascript
	function _sanitizeString(str){
	    str = str.replace(/[^a-z0-9áéíóúñü \.,_-]/gim,"");
	    return str.trim();
	}

	function _queryLocal(storage,objName,query){
		console.log('DATASERVICE -> IN _queryLocal(), storage: ',storage,' objName: ',objName,' query: ',query,' typeof query: ', typeof query);

		// 'storage' is either temp or perm
		if(storage != 'temp' && storage != 'perm')
			return new Error('Storage is empty or wrong type');

	 	// if query is a string and empty, return error
	 	if((typeof query == 'string' && query == ''))
	 		return new Error('Query is empty or wrong type');

	 	// if that object doesn't exist in localStorage 
	 	// (objName could be 'pitchers' or 'pulls')
	 	if(!$localStorage[storage][objName])
	 		return new Error('Object '+objName+' does not exist in localStorage['+storage+']');

	 	// if empty query & query is object, then return all instances of 'objName'
	 	if(typeof query == 'object' && !Object.keys(query).length) {
	 		return $localStorage[storage][objName];
	 	}

		console.log('DATASERVICE -> _queryLocal(), CLEARED ALL ERROR CHECKS,localStorage',$localStorage);
	 	
	 	// query is: {'team':team} or { _id : id} or something similar
	 	var dataForReturn = [];
	 	var tempDataList = $localStorage[storage][objName];
	 	if(tempDataList.data)
	 		tempDataList = tempDataList.data;
	 	console.log('DATASERVICE -> _queryLocal(), tempDataList: ',tempDataList);
	 	var obj;
	 	var returnStatus;
	 	for(var index in tempDataList){
			obj = tempDataList[index];
	 		returnStatus = false;
	 		for(var field in query){
				if (obj[field].constructor == Array){
					if(_arraysEqual(obj[field],query[field]))
						returnStatus = true;
				}else{
					if(obj[field] && obj[field] == query[field]){
		 				returnStatus = true;
		 			}
				}
	 		}
	 		if(returnStatus)
	 			dataForReturn.push(obj);
	 	}
		console.log('DATASERVICE -> _queryLocal(), dataForReturn',dataForReturn);
	 	return dataForReturn;

	}

	function _saveToLocalPerm(objName,data,overwrite){
		console.log('DATASERVICE -> _saveToLocalPerm(): overwrite',overwrite);
		if(overwrite){
			console.log('DATASERVICE -> _saveToLocalPerm(), pushing to localStorage');
			// replace
			console.log('$localStorage.perm before',$localStorage.perm);
			$localStorage.perm[objName] = data;
			console.log('$localStorage.perm after',$localStorage.perm);
		}else{
			console.log('DATASERVICE -> _saveToLocalPerm(), appending to localStorage');
			// append 
			for(i in data){
				$localStorage.perm[objName].push(data[i]);
			}
		}
	}

	function _findInLocal(storage,id){
		// storage == 'perm' || storage == 'temp'
		// !!!!! need to go through queried localStorage records, not all records
		for(j=0;j <= $localStorage.perm[objName].length; j++){
			l = $localStorage.perm[objName][j];
			if(c.id == l.id){
				// if Stamplay[objName].dt_update is newer then 
				// localStorage.perm[objName].dt_update, replace localStorage
				// record with record from Stamplay
				if(c.dt_update > l.dt_update)
					l = angular.copy(c);
				found = true;
			}
		}
	}

	function _hashString(string){
		var hash = 0, i, chr;
		if (string.length === 0) return hash;
		for (i = 0; i < string.length; i++) {
			chr   = string.charCodeAt(i);
			hash  = ((hash << 5) - hash) + chr;
			hash |= 0; // Convert to 32bit integer
		}
		return hash;
	}

	// taken from http://stackoverflow.com/questions/3115982/how-to-check-if-two-arrays-are-equal-with-javascript
	function _arraysEqual(a, b) {
		if (a === b) return true;
		if (a == null || b == null) return false;
		if (a.length != b.length) return false;

		// If you don't care about the order of the elements inside
		// the array, you should sort both arrays here.
		a.sort();
		b.sort();

		for (var i = 0; i < a.length; ++i) {
			if (a[i] !== b[i]) 
				return false;
		}
		return true;
	}
}

})(this);