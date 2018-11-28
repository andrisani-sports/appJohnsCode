(function(gScope){

angular.module(gScope.AppNameId)
		.factory('bluetoothService', ['$rootScope', '$log', '$q', init]);


function init($rootScope, $log, $q){
	
	var service = {};

	//constants for the device
	
	var analogPorts = [0,1,2,3,4,5,8];
	var Unipolar = 1;
	var Bipolar = 0;
	var _Polarity = Unipolar;
	var _Gain = 0;
	var V2_5 = 1;
	var	V1_25 = 0;
	var _VRef = V2_5;	
	// var MAC_ADDRESS = "00:06:66:0A:32:9D"; // 20-16-12-12-78-98
	var MAC_ADDRESS = "20:16:12:12:78:98"; // the new Arduino BT board

	var READ 			= getReadAnlogCommand(analogPorts[0],analogPorts[6]);   //read analog command code
	var IDENTIFY 		= '>' + checksum("i"); 									//identify command code
	var RESET 			= '>' + checksum("R"); 									//reset command code

	var SAMPLE_LOOP 	= null;													//this is the setInterval instance used while read looping

	service.connect = connect;
	service.disconnect = disconnect;
	service.subscribe = subscribe;
	service.start = start;
	service.stop = stop;
	service.getUnpaired = getUnpaired;
	service.setBluetoothClient = setBluetoothClient;

	return service;


	//Service Functions

	function getUnpaired(){
		var deferred = $q.defer();
		bluetoothSerial.discoverUnpaired(function(list){
			console.log('list of devices',list);
			deferred.resolve(list);
		}, function(){
			deferred.reject('failed to get list of unpaired');
		})
		return deferred.promise;
	}

	function setBluetoothClient(device){
		// example: [{ "class": 276, "id": "10:BF:48:CB:00:00", "address": "10:BF:48:CB:00:00", "name": "Nexus 7" }]
		MAC_ADDRESS = device.address;
	}

	function connect(){
		var deferred = $q.defer();
		bluetoothSerial.connect(MAC_ADDRESS, 
			function(result){
				console.log('connected to the NEW device');
				deferred.resolve('connected to ' + MAC_ADDRESS);
			},

			function(err){
				console.log('failed to connect. ERR:',err);
				deferred.reject('failed to connect');
			}
		);

		return deferred.promise;
	}

	function disconnect(){
		stop();
		bluetoothSerial.unsubscribe();
		bluetoothSerial.disconnect();
	}

	function subscribeOld(callback){
		bluetoothSerial.subscribe('\r', function(data){ callback(decodeData(data)); } , failure);
	}

	function subscribe(callback){
console.log('BLUETOOTH FACTORY: subscribe');
		bluetoothSerial.subscribe('\r',function(data){
			callback(data);
		},
		failure);
	}

	function start(interval){
		if(interval > 10)
	      SAMPLE_LOOP = setInterval(function(){
	    
	    	bluetoothSerial.write(READ);
	   	
	      },interval);
	  	else console.log('too fast');
	}

	function stop(){
		if(SAMPLE_LOOP) window.clearInterval(SAMPLE_LOOP);
		SAMPLE_LOOP = null;
	}


	//Driver Functions

	function failure(err){
		console.log('error', err);
	}

	function decodeData(buffer){
		//decodes the data received from the device
		var data = checksumOK(buffer);
console.log('buffer',buffer,'data',data);
	    if(data.success){
	         var rawdata = parseInt(data.value, 16);
	         if (_Polarity == Bipolar){
	            if (rawdata > 0x7FFFFF) rawdata = rawdata - 0x1000000;
	            rawdata = rawdata * 2;
	            }

		    var g = 1 << _Gain;
		    rawdata = rawdata / g;
		    var volt = (rawdata * 1.25 * (1 + _VRef))/0xFFFFFF;    

	    } else rawdata = 0;
	 
	    //we want are reading the voltage
	    return {rawdata:rawdata, volt:volt};
	}

	function getReadAnlogCommand(pinA, pinB){
		//the read command encodes which ports to read
			var ai = (pinA * 16 + pinB) % 256;
	        var c = '>' + checksum('t' + hexEncode(ai,2));
	        return c;
	}


	function checksum(string){
		//needed to encode commands with their checksum
	    var _cs = 0;
	    for(var i = 0; i < string.length; i++){
	        var ch = string[i];
	        _cs = (_cs + ord(ch)) % 256;   
	        }
	    var res = string + hexEncode(_cs,2);
	    return res;
	}

	function checksumOK(string){
		//used to verify integrity of data from the device
	    var output = '';
	    var chksum = '';
	    string = string.trim();
	    if(string[0] == 'A') {
	        output = string.slice(1,string.length - 2);  
	        chksum = string.slice(string.length-2,string.length);
	        var _cs = 0;

	        for(var i = 0; i < output.length; i++){
	          var ch = output[i];
	          _cs = (_cs + ord(ch)) % 256;
	        }
	        var val = hexEncode(_cs,2);
	        
	        if(val == chksum)
	          return {success: true, value: output}

	        }
	      return {success:false, value: 'err'}
	     
	}


	//Hex Manipulation Helper Functions

	function hexEncode(value, digits){

		var base = "";
		for(var i = 0; i < digits; i++) base += "0";
		var hexCode = (base + value.toString(16)).substr(-digits).toUpperCase()
		return hexCode;
		
	}

	function ord (string) {
	  //  discuss at: http://locutus.io/php/ord/
	  // original by: Kevin van Zonneveld (http://kvz.io)
	  // bugfixed by: Onno Marsman (https://twitter.com/onnomarsman)
	  // improved by: Brett Zamir (http://brett-zamir.me)
	  //    input by: incidence
	  //   example 1: ord('K')
	  //   returns 1: 75
	  //   example 2: ord('\uD800\uDC00'); // surrogate pair to create a single Unicode character
	  //   returns 2: 65536
	  var str = string + ''
	  var code = str.charCodeAt(0)
	  if (code >= 0xD800 && code <= 0xDBFF) {
	    // High surrogate (could change last hex to 0xDB7F to treat
	    // high private surrogates as single characters)
	    var hi = code
	    if (str.length === 1) {
	      // This is just a high surrogate with no following low surrogate,
	      // so we return its value;
	      return code
	      // we could also throw an error as it is not a complete character,
	      // but someone may want to know
	    }
	    var low = str.charCodeAt(1)
	    return ((hi - 0xD800) * 0x400) + (low - 0xDC00) + 0x10000
	  }
	  if (code >= 0xDC00 && code <= 0xDFFF) {
	    // Low surrogate
	    // This is just a low surrogate with no preceding high surrogate,
	    // so we return its value;
	    return code
	    // we could also throw an error as it is not a complete character,
	    // but someone may want to know
	  }
	  return code
	}
}



})(this);