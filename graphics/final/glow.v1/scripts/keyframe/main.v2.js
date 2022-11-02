/** Handles the keyframe animation of an actor
 */
KeyFrame = (function() {

	var PREFIX = "kf_",
		KF_CLASS = "keyframe",
		SELECTED_CLASS = "selected",
		KF_DATA = "Text",
		FILM_TIME = 410,
		FILM_SPEED = 40,
		STORAGE_COUNTER = "hw10_animation_counter",
		STORAGE_NAME = "hw10_animation_name_",
		STORAGE_VALUE = "hw10_animation_value_";


	/* UI Elements
	 * ------------
	 */
	var kfs_el, // <dom element> where we hang the key-frame divs
		kf_id = 0, // counter for the ids of the key-frame divs
		selectedKeyframe, // <dom element> of the selected key-frame
		select_el; // <dom element> select for load animation


	/* Record Mode
	 * ------------
	 */
	var datafields, // names of the fields that can be modified in each key-frame
		keyframes_el = {}, // <dom element> of each key-frame, indexed by key-frame id
		keyframes = [], // list of key-frames sorted by insertion
		inorderKFs; // list of key-frames sorted by key-frame time

	/* Animation Mode
	 * ------------
	 */
	var lasttime = 0, // time since las update
		runningTime = 0, // total running time, to keep track of current frame
		paused = true,
		kf = 0; // index in inorderKFs of the key-frame that is being executed

	/* Storage
	 * ------------
	 */
	var pre_animations = {}; // preloaded animation


	/** KEY-FRAME user triggered events
	 * -----------------------------------------------------------------------------
	 */

	var deleteCurrentkf = function() {
		var indx = keyframes.indexOf(selectedKeyframe);
		var el = document.getElementById(keyframes[indx].id);
		kfs_el.removeChild(el);
		keyframes.splice(indx, 1);

	}

	var addkeyframe = function(x, nondrag, data) {
		if (!paused) return;

		var kf = {};
		var el = document.createElement('div');

		// UI
		if (!nondrag) {
			el.ondragstart = function(event) {
				event.dataTransfer.setData(KF_DATA, event.target.id);
			}
			el.draggable = true;
		}
		el.settime = function(time) {
			kf.time = time;
			el.style.left = time;
		}
		el.onclick = function(event) {
			selectKeyframe(kf);
		};

		kf.id = PREFIX + kf_id++;
		el.id = kf.id;
		el.classList.add(KF_CLASS);
		el.settime(x);

		kfs_el.appendChild(el);

		keyframes.push(kf);
		keyframes_el[kf.id] = el;
		sortkeyframes();
		kf.data = {};

		var idx = inorderKFs.indexOf(kf);
		if (data === undefined) {
			clonedata(kf.data, (idx >= 1) ? inorderKFs[idx - 1].data : datafields);
		} else {
			clonedata(kf.data, data);
		}

		selectKeyframe(kf);

	}

	var selectKeyframe = function(kf) {
		var selected = document.querySelector(".keyframe.selected");
		if (selected != null) {
			selected.classList.remove(SELECTED_CLASS);
		}
		keyframes_el[kf.id].classList.add(SELECTED_CLASS);

		selectedKeyframe = kf;
		loadKeyframeData(kf);

	}

	/** copy from kf to dom **/
	var loadKeyframeData = function(kf) {
		for (var id in datafields) {
			document.getElementById(id).value = kf.data[id];
		}
	}

	/** copy from dom to kf **/
	var updateKeyframeData = function() {
		for (var id in datafields) {
			selectedKeyframe.data[id] = document.getElementById(id).value;
		}
	};


	/** ANIMATION EVENTS
	 * -----------------------------------------------------------------------------
	 */


	/** update animation
	 * creates interpolation between current and next frame
	 */
	var update = function(time) {
		var elapsed = (time - lasttime);
		lasttime = time;

		// update running time
		if (!paused) {
			runningTime = runningTime + FILM_SPEED * elapsed;
			if (runningTime > FILM_TIME) {
				restartAnimation(time);
			}
			// update UI
			document.getElementById("time").style.left = runningTime;
			var nextkf = kf + 1;
			if (nextkf < inorderKFs.length) { // there is a next frame
				if (inorderKFs[nextkf].time <= runningTime) { // is time for next frame
					kf = nextkf;
					update(time);
					return;
				} else {
					var kf0 = inorderKFs[kf];
					var kf1 = inorderKFs[nextkf];
					var t = easyCurve((runningTime - kf0.time) / (kf1.time - kf0.time));
					for (var id in datafields) {
						document.getElementById(id).value = lerp(t, kf0.data[id], kf1.data[id]);
					}
				}
			}
		}
	};

	/* Running Control
	 * ----------------------------- */
	var pauseAnimation = function() {
		paused = true;
	}
	var resumeAnimation = function() {
		paused = false;
	}
	var stopAnimation = function() {
		kf = 0;
		paused = true;
		runningTime = 0;
		if (inorderKFs.length > 0) {
			selectKeyframe(inorderKFs[0]);
		}
		document.getElementById("time").style.left = runningTime;

		var inputs = document.querySelectorAll("#controllers input");
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].disabled = false;
		}
		document.querySelector("#controllers").disabled = false;
		select_el.disabled = false;
	}

	var startAnimation = function(time) {
		kf = 0;
		paused = false;
		lasttime = time;
		runningTime = 0;

		var inputs = document.querySelectorAll("#controllers input");
		for (var i = 0; i < inputs.length; i++) {
			inputs[i].disabled = true;
		}
		document.querySelector("#controllers").disabled = true;
		select_el.disabled = true;
	}

	var restartAnimation = function(time) {
		stopAnimation();
		startAnimation(time);
	}

	var newAnimation = function() {
		cleanAnimation();
		addkeyframe(0, true);
		select_el.value = 0;

	}

	/* Storage and Recovery
	 * ----------------------------- */

	var cleanAnimation = function() {
		stopAnimation();
		keyframes_el = {};
		keyframes = [];
		kfs_el.innerHTML = "";
	}

	var addAnimation = function(name, animation) {
		pre_animations[name] = animation;
		select_el.addOption(name, name);
	}

	var saveAnimation = function() {
		// fancy
		if (!window.localStorage) {
			console.warn("cant save, no local storage");
			return;
		}

		var name = prompt("Please enter name for sequence", "my_sequence");
		if (name == null) { // user cancel
			return;
		}
		var value = JSON.stringify(inorderKFs);
		var counter = parseInt(localStorage.getItem(STORAGE_COUNTER) || "0");

		localStorage.setItem(STORAGE_NAME + counter, name);
		localStorage.setItem(STORAGE_VALUE + counter, value);
		counter = counter + 1;
		localStorage.setItem(STORAGE_COUNTER, counter);

		addAnimation(name, value);
		select_el.value = name;
		return value;
	}

	var loadAnimation = function(name) {
		var json = pre_animations[name];
		var keyframes = JSON.parse(json);

		cleanAnimation();
		for (var i = 0; i < keyframes.length; i++) {
			var kf = keyframes[i];
			addkeyframe(kf.time, i == 0, kf.data);
		}
		stopAnimation();
	}



	/** INITIAL SETUP
	 * -----------------------------------------------------------------------------
	 */
	var initialize = function(options) {
		if (options.defaults !== undefined) {
			datafields = options.defaults;
		}
		_addhandlers();

		if (options.animations !== undefined) {
			_addAnimations(options.animations);
		}
		_loadAnimations(); // from local storage

	}

	var _addAnimations = function(animations) {
		for (var name in animations) {
			pre_animations[name] = animations[name];
			select_el.addOption(name, name);
		}
	}

	var _loadAnimations = function() {
		if (!window.localStorage) {
			console.warn("cant load, no local storage");
			return;
		}
		var counter = parseInt(localStorage.getItem(STORAGE_COUNTER) || "0");
		for (var i = 0; i < counter; i++) {
			var name = localStorage.getItem(STORAGE_NAME + i);
			var animation = localStorage.getItem(STORAGE_VALUE + i);
			if (name === null || animation === null) {
				console.warn("failed loading sequence " + i + ". name:", +name + " sequence: " + sequence);
			} else {
				addAnimation(name, animation);
			}

		}
	}

	/** create listeners to keyframe DOM elements */
	var _addhandlers = function() {
		kfs_el = document.getElementById('keyframeline');

		kfs_el.ondblclick = function(event) {
			var r = event.target.getBoundingClientRect();
			var x = event.clientX - r.left;
			var y = event.clientY - r.top;
			addkeyframe(x);
		}

		kfs_el.ondrop = function(event) {
			event.preventDefault();

			// get dropped element
			var data = event.dataTransfer.getData(KF_DATA);
			var kf = document.getElementById(data);

			// update position
			var r = event.target.getBoundingClientRect();
			var x = event.clientX - r.left;
			kf.settime(x);

			// sort keyframes
			sortkeyframes();

		};

		kfs_el.ondragover = function(event) {
			event.preventDefault();
		}

		select_el = document.getElementById("select_anim");
		select_el.onchange = function() {
			if (this.value != 0) {
				loadAnimation(this.value);
			} else {
				newAnimation();
			}
		};

		select_el.addOption = function(val, name) {
			var opt = document.createElement('option');
			opt.value = val;
			opt.innerHTML = name;
			this.appendChild(opt);
		}

		// add default initial frame
		addkeyframe(0, true);
	}

	/* Utility functions
	 * ----------------------------- */
	var sortkeyframes = function() {
		inorderKFs = keyframes.sort(function(a, b) {
			return a.time > b.time ? 1 : -1;
		});
	}

	var clonedata = function(obj, data) {
		for (var id in data) {
			obj[id] = data[id];
		}
	}

	/* Math interpolation functions
	 * ----------------------------- */

	var easyCurve = function(t) {
		return (3 - 2 * t) * t * t;
	}

	var lerp = function(t, a, b) {
		return a / 1 + t * (b / 1 - a / 1);
	};

	return {
		updateEditMode: updateKeyframeData,
		run: startAnimation,
		stop: stopAnimation,
		pause: pauseAnimation,
		resume: resumeAnimation,
		saveAnimation: saveAnimation,
		updateRunMode: update,
		initialize: initialize,
		deleteCurrentkf: deleteCurrentkf,
		newAnimation: newAnimation
	}
})();