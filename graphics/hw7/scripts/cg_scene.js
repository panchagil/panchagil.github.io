var CG = CG || {};

CG.scene = (function() {

	var createGridVertexBuffer = function(gl, vertArray) {
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertArray), gl.STATIC_DRAW);

		vertexBuffer.itemSize = 3;
		vertexBuffer.numItems = vertArray.length / vertexBuffer.itemSize;

		return vertexBuffer;
	};

	function createSurfaceVertexBuffer(gl, vertArray) {
		var vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertArray), gl.STATIC_DRAW);

		vertexBuffer.positionElementCount = 3;
		vertexBuffer.normalElementCount = 3;
		vertexBuffer.uvElementCount = 2;

		vertexBuffer.positionOffset = 0 * Float32Array.BYTES_PER_ELEMENT;
		vertexBuffer.normalOffset = 3 * Float32Array.BYTES_PER_ELEMENT;
		vertexBuffer.uvOffset = 6 * Float32Array.BYTES_PER_ELEMENT;
		vertexBuffer.stride = 8 * Float32Array.BYTES_PER_ELEMENT;

		vertexBuffer.numItems = vertArray.length / 8;
		return vertexBuffer;
	}

	var createStripIndexBuffer = function(gl, vertArray) {
		var index = [];
		for (var j = 0; j < vertArray.length / 3; j++) {
			index.push(j);
		}
		var indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(index), gl.STATIC_DRAW);
		return indexBuffer;

	};

	var addObject = function(canvas, vertArray, matrix) {
		var obj = {
			matrix: matrix
		};
		obj.vertexBuffer = createGridVertexBuffer(canvas.gl, vertArray);
		obj.indexBuffer = createStripIndexBuffer(canvas.gl, vertArray);

		canvas.objs = canvas.objs || [];
		canvas.objs.push(obj);
	};

	var addSurface = function(canvas, vertArray, matrix, options) {
		var obj = {
			matrix: matrix
		};
		obj.options = options;
		obj.vertexBuffer = createSurfaceVertexBuffer(canvas.gl, vertArray);
		canvas.objs = canvas.objs || [];
		canvas.objs.push(obj);
	}

	var drawScene = function(canvas) {
		var gl = canvas.gl;
		var shader = canvas.program;

		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		var objects = canvas.objs;
		for (var i = 0; i < objects.length; i++) {
			// TODO: program should be associated to the object
			canvas.shader.drawObject(gl, canvas.program, objects[i]);
		}

	}
	return {
		addObject: addObject,
		addSurface: addSurface,
		drawScene: drawScene
	}
})();