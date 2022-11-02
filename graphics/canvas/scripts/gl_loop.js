(function(main){
	var context, width, height, imageData, data;
	var startTime;

	window.onload = function(){
		var element = document.getElementById("canvas1");	
		context = element.getContext("2d");
		width = element.width;
		height = element.height;

		imageData = context.createImageData(width, height);
		data = imageData.data;
		startTime = (new Date()).getTime() / 1000.0;
		animate();
	}
	
	var animate = function(){
		var currentTime = (new Date()).getTime() / 1000.0 - startTime;
		for (var x=0; x < width; x++){
			var u = x/width;
			for (var y = 0; y < height; y++){	
				var v = 1.0 - y/height;
				var color = main(u, v, currentTime);
				var index = (x + y * width) * 4;
				data[index + 0] = color[0] * 255;
				data[index + 1] = color[1] * 255;
				data[index + 2] = color[2] * 255;
				data[index + 3] = color[3] * 255;
			}
		}
		context.putImageData(imageData, 0, 0);
		//requestAnimationFrame(animate);
    }	
}(MAIN));