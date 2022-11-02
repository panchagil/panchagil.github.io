var CG = CG || {};
CG.App = (function() {

	var App = function() {
		this.scenes = [];
		this.tick();
	};

	App.prototype.start = function(scene, el) {
		scene.glHelper = new GLHelper.Helper(el);
		scene.glHelper.initGL();
		scene.start();
		this.scenes.push(scene);
	};

	App.prototype.tick = function() {
		for (var i = 0; i < this.scenes.length; i++) {
			this.scenes[i].update();
		}
		var app = this;
		requestAnimationFrame(function() {
			app.tick();
		});
	};
	return App;
})();