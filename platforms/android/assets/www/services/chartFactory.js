(function(gScope){

angular.module(gScope.AppNameId)
		.factory('chartService', ['$rootScope', '$log', init]);


function init($rootScope, $log){
	var service = {};
	var charts = {};
    var chart = null;

    service.makeChart = makeChart;
    service.setData = setData;
    service.addData = addData;
    service.addSeries = addSeries;
    service.getChartIds = getChartIds;

	return service;


	 function makeChart(targetDiv, clickHandler){
	    charts[targetDiv] = new Chartist.Line(targetDiv, {
	          series: [[]]
	        }, {
	          axisX: {
	            type: Chartist.AutoScaleAxis,
	            onlyInteger: true,
	          }
	        });

	    if(clickHandler) 
	        setTimeout(function(){
	        var points = document.getElementsByClassName('ct-point')
	        for(var i = 0; i < points.length; i++)
	                points[i].addEventListener('click', clickHandler);
	            
	        }, 300);
	    

	    }

	function addSeries(targetDiv){
	    charts[targetDiv].data.series.push([]);
	}

	function setData(targetDiv, data, iSeries){
	    if(!iSeries) iSeries = 0;
	    charts[targetDiv].data.series[iSeries] = data;
	    charts[targetDiv].update();
	}

	function addData(targetDiv, data, series){
	    if(!iSeries) iSeries = 0;
	    if(Array.isArray(data)){
	        charts[targetDiv].data.series[iSeries] = charts[targetDiv].data.series[iSeries].concat(data);
	    } else{
	        charts[targetDiv].data.series[iSeries].push(data);
	    }
	    charts[targetDiv].update();
	}

	function getChartIds(){
		return Object.keys(charts);
	}

	function onPointClick(mouseEvent){
	    var object = this;
	    var dataString = this.getAttribute('ct:value').split(',');
	    var index = parseFloat(dataString[0]);
	    var value = parseFloat(dataString[1]);
	    log(index + ", " +value);
	    
	}

}



})(this);