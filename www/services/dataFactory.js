(function(gScope){

	console.log('dataFactory line 3');

angular.module(gScope.AppNameId)
.factory('dataService', ['$rootScope', '$log', '$localStorage', '$q','$location', '$http', init]);

function init($rootScope, $log, $localStorage, $q, $location, $http){

	/**
	 * RESTDB FUNCTIONS
	 */
	var restdb = {
		_url: "https://andrisani-7eb3.restdb.io/rest/",
		_settings: {
			"async": true,
			"crossDomain": true,
			"headers": {
			  "content-type": "application/json",
			  "x-apikey": "5bac2705bd79880aab0a778e",
			  "cache-control": "no-cache"
			}
		},
		get: function(obj,query) { 
			var settings = angular.copy(this._settings);
			settings.url = this._url + obj;
			settings.method = 'GET';
			
			return $http(settings);
		},
		patch: function(obj,id,data){
			var settings = angular.copy(this._settings);
			settings.url = this._url + obj + '/' + id;
			settings.method =  "PUT";
			settings.processData = 'false';
			settings.data = JSON.stringify(data);
			
			return $http(settings);
		},
		save: function(obj,data){
			if(typeof data == 'array'){
				return new Error('Cannot save array to backend');
			}
			var settings = angular.copy(this._settings);
			settings.url = this._url + obj;
			settings.method = "POST";
			settings.processData = 'false';
			settings.data = JSON.stringify(data);
			
			return $http(settings);
		}
	}

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
	// 		do a get on the local_hash field in backend
	// 		if a record exists, mark as 'verified' in localStorage
	// 4. check to see if close to limit, and if so, clear old pull data

	// PROCESS FOR READ
	// 1. Check to see if data exists in localStorage
	// 2. if Yes, set to return variable, but don't return to $scope yet
	// 3. check if Internet is available
	// 4. if Yes, check for updated data from backend
	// 5. compare new data with local data
	// 6. if new data is better then local data, store in localS, then return to $scope

	var service = {};

	service.getObj = getObj;
	service.saveObj = saveObj;
	service.pushPendingToCloud = pushPendingToCloud;
	service.login = login;

	return service;

	/**
	 * GET
	 */

	function getObj(objName,query){ // PROCESS FOR READ
		var p = $q.defer();

		console.log('DATASERVICE -> getObj(), query: ',query,' objName: ',objName);
		
		// 1. Check to see if data exists in localStorage
// ??? does the try actually catch an error?		
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
		// NOTE: returnData will be false if no data found locally, but it 
		// doesn't matter as it is a valid value to send back to the service, 
		// and will be resolved below
		
		returnData = angular.copy(localData);
		console.log('DATASERVICE -> returnData',typeof returnData,returnData);

		// 3. check if Internet is available
		
		if($rootScope.online){
		
		// 4. if Yes, check for updated data from backend
		
			restdb.get(objName,query)
			.then(function(response) {
				if(response.data)
					response = response.data;
				console.log('DATASERVICE -> getObj(), db response',response);
		// 5. compare new data with local data if nothing in localStorage
				
				if(returnData == false){
					console.log('DATASERVICE -> getObj(), return == false // adding result to returnData and saving to local perm');
					returnData = response;
					_saveToLocalPerm(objName,response,true);
				}else{
					console.log('DATASERVICE -> getObj(), return == true // going through result line by line to add to perm');
					
					// set up variables for loop below
					var i; // counter in parent for() loop
					var j; // counter in child for() loop
					var c; // the current response record
					var l; // the corresponding localStorage record
					var found; // flag - whether a match or not

					// go through each record from backend
					for(i=0; i < response.length; i++){
						found = false;
						c = response[i];
					// find the corresponding record in localStorage.perm with _id
						l = _compareToLocal('perm',objName,c);
						if(l == false){
							// if any db records left over, add to localStorage.perm
							// cause they would have originated off-device (admin panel)
							_saveToLocalPerm(objName,c,false);
							returnData.push(c);
						}

					}
					console.log('DATASERVICE -> getObj() // DONE going through each, returnData',returnData);
					// check for records in localStorage.temp, append to returnData
					var tempRecords = $localStorage.temp[objName];
					console.log('DATASERVICE -> getObj() // going through localStorage.temp for '+objName,tempRecords);
					if(tempRecords && tempRecords.length > 0){
						tempRecords.map(function(e){
							if(e)
								returnData.push(e);
						});
					}
					console.log('DATASERVICE -> getObj() // DONE pushing temp records, returnData',returnData);
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

		// check for errors
		if(!tempData){
			$rootScope.$broadcast('doneSavingData');
			return false;
		}

		var p = $q.defer();

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
		console.log('DATASERVICE -> saveObj(), data being pushed',data);

		// 1. get data to be written and save to $localStorage.temp
		// 		add a hash for identification
		// 		add a timestamp to help with uniqueness
		// 		attempt to save to db backend (with hash)

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
			if(data[i]){
				$localStorage.temp[objName].push(data[i]);
				console.log('DATASERVICE -> saveObj(), pushed to localStorage.temp',data[i]);
			}

			// check if Internet connection available
			if($rootScope.online){
				// save to backend, add promise to array
				if(data[i]['_id']){
					var thisId = data[i]['_id'];
					delete data[i]['_id'];
					console.log('DATASERVICE -> saveObj(), about to do PUT (.patch) to backend: data,',data[i]);
					promiseArray.push(restdb.patch(objName,thisId,data[i]));
				}else{
					console.log('DATASERVICE -> saveObj(), about to do POST (.save) to backend: data,',data[i]);
					promiseArray.push(restdb.save(objName,data[i]));
				}
			}
			
			console.log('DATASERVICE -> saveObj(), array of promises to backend, length',promiseArray.length);

		}

		// saves could fail if Internet dies out mid-save, so it is possible 
		// that array could be empty if all attempts fail
		if(promiseArray.length > 0){ 
			$q.all(promiseArray).then(function(result){
				console.log('DATASERVICE -> saveObj(), in $q.all: result',result);
				var record;
				var i;
				var j;
				var k;
				var override;
				for(i in result){
					// each result should be a record in localStorage.temp
					// so find that record, and move it to localStorage.perm
					override = false;
					for(k in $localStorage.perm[objName]){
						if($localStorage.perm[objName][k]['id'] == result[i].id){
							$localStorage.perm[objName][k] = result[i];
							override = true;
						}
					}
					if(!override)
						$localStorage.perm[objName].push(result[i]);
					for(j in $localStorage.temp[objName]){
						record = $localStorage.temp[objName][j];
						if(record && record.hash === result[i].hash){
							// delete $localStorage.temp[objName][j];
							$localStorage.temp[objName].splice(j,1);
						}
					}
				}
				p.resolve(true);
			});
		}
		console.log('DATASERVICE -> saveObj(), FINISHED');

		return p.promise;
	}

	/**
	 * 
	 */
	
	 function pushPendingToCloud(){
	
	 	var pending = $localStorage.temp;
	 	var promiseArray = [];

	 	for(objName in pending){
	 		// check if Internet connection available
			if($rootScope.online){
				// save to backend, add promise to array
				for(var i in pending[objName]){
					var data = pending[objName][i];
					if(!data)
						// delete pending[objName][i];
						pending[objName].splice(i,1);
					else{
						promiseArray.push(restdb.save(objName,data));
					}
				}
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
						if(record && (record.hash === result[i].hash)){
							// delete $localStorage.temp[objName][j];
							$localStorage.temp[objName].splice(j,1);
						}
					}
				}
			});
		}

	 }

	function login(){
		// ??? (restdb.io)
		// .then(function(user) {
		// 	window.localStorage['user'] = JSON.stringify(user);
		// 	window.localStorage['userTeam'] = user.team;
		// }, function(error) {
		// 	errorHandler({
		// 		title : "<h4 class='center-align'>Incorrect Username or Password</h4>"
		// 	});
		// });
		window.localStorage['user'] = '{ "name": "test pitcher", "_id": "asdf-safdg8-as3h" }';
		window.localStorage['userTeam'] = '{ "name": "test team", "_id": "hukmh-safdg8-as3h" }';
		return true;
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
				if (obj[field] && obj[field].constructor == Array){
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

	function _compareToLocal(storage,objName,c){
		if(!c)
			return false;
		var ret = false;
		var l;
		if($localStorage.perm[objName].length > 0){
			for(i=0;i < $localStorage.perm[objName].length; i++){
				l = $localStorage[storage][objName][i];
				if(c.id == l.id){
					if(c.dt_update > l.dt_update)
						ret = angular.copy(c);
					else
						ret = l;
				}
			}
			return ret; // if there is no match above, ret == false
		}else{
			return ret; // ret == false 
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