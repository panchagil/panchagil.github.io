MAIN = (function(){
	var main = function(u, v, time){
		var s =  0.5 + 0.5 * Math.sin(30.0 * u - Math.sin(4.0*time))
	                    * Math.sin(30.0 * v - Math.cos(4.0*time));	
	    return [u, v, s, 1.0];
	}
	return main;
})();