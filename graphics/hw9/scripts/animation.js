Animation = (function() {

	/* Transitions 
	 * -------------------- */
	var Key = {
		ENTER: 13,
		SPACE: 32,
		ZERO: 48,
		S: 115
	};
	var NUM_FRAMES = 40;

	var animations = {}; // available animations specified by the user

	var lasttime = 0, // time since las update
		runningTime = 0, // total running time, to keep track of current frame
		frame = 0; // current frame 

	var transition = 0, // time [0,1] of the current transition
		kfdefault, // base status to us on start
		kf0, kf1; // transition from key-frame 0 to 1


	var queue = [], // queue of transitions to execute
		moviequeue = []; // queue if transitions to run as a small film

	var running = false, // is film running
		pause = false; // is film paused

	var sequences = {}; //saved sequences

	var addSequence = function(name, sequence) {
		sequences[name] = sequence;
	}

	var addAnimation = function(animation) {
		animation.key = animation.key.toUpperCase();
		animations[animation.key] = animation;
	}

	var setInitialKeyFrame = function(action) {
		kfdefault = animations[action.toUpperCase()];
		kf0 = kfdefault;
		kf1 = kfdefault;
	}

	var update = function(time) {

		var elapsed = (time - lasttime);
		lasttime = time;

		if (!pause) {

			// runningTime helps us keep track of the current frame
			if (running) {
				runningTime = runningTime + elapsed;
				frame = Math.floor(runningTime);
			}

			// Transition keeps the t \in [0,1] of the current transition
			transition = Math.min(1, transition + elapsed);

			// If is 1, then the transition finished. We check if there is 
			// any transition left in the queue.
			if (transition == 1 && queue.length > 0) {
				transition = 0;
				kf0 = kf1;
				kf1 = queue.shift(); // gets the first item on the queue
			}

			UI.updateInterface(frame, kf1);

		}

		// finally calculate the interpolated parameters for the current transition
		var params = [];
		for (var i = 0; i < 9; i++) {
			params[i] = lerp(easyCurve(transition), kf0.motion[i], kf1.motion[i]);
		}
		return params;
	}

	var addKeyframe = function(keychar) {
		// only add new keyframes during recording
		if (running) {
			return;
		}


		// add to moviequeue
		var kf = moviequeue.length;
		moviequeue.push(animations[keychar]);

		// -- user friendly
		// add to current queue so the user can see the animation
		// only add if different than current animation, and different from
		// the last animation in the stack
		var current = kf1.key;
		var stack = (queue.length > 0) ? queue[queue.length - 1].key : kf1.key;

		if (keychar !== current || keychar != stack) {
			queue.push(animations[keychar]);
		}

		return kf;
	}


	/** Starts playing the movie defined by the keyframes in
	 * moviequeue
	 */
	var play = function() {
		// clean the queue and add all the items in movie queue
		queue.length = 0;
		[].push.apply(queue, moviequeue); // i.e push all

		// resets
		runningTime = 0;
		transition = 1;

		running = true;
	}

	/** Toogle pause state, only works during movie 
	 */
	var tooglePause = function() {
		if (running) {
			pause = !pause;
		}
	}

	var resetoDefaults = function() {
		kf0 = kfdefault;
		kf1 = kfdefault;

		lasttime = 0;
		runningTime = 0;
		frame = 0;

		queue.length = 0;
		moviequeue.length = 0;

		pause = false;
		running = false;
	}


	var loadSequence = function(name) {
		resetoDefaults();
		UI.cleanUI();
		var sequence = sequences[name] || [];
		for (var i = 0; i < sequence.length; i++) {
			var keychar = sequence.charAt(i).toUpperCase();
			moviequeue.push(animations[keychar]);
			UI.addKeyframe(keychar, i);
		}
	}


	/** All UI operations
	 ** ----------------------- */
	var UI = {};

	// update functions
	// ----------------

	var oldonpress = document.onkeypress || function() {};
	document.onkeypress = function(event) {
		oldonpress();

		var keychar = String.fromCharCode(event.which).toUpperCase();
		UI.handlekeypress(keychar, event.which);
	}

	UI.handlekeypress = function(keychar, key) {
		if (animations[keychar] !== undefined) {
			var frameid = addKeyframe(keychar);
			UI.addKeyframe(keychar, frameid);

		} else if (key == Key.ENTER) {
			play();
		} else if (key == Key.SPACE) {
			tooglePause();
		} else if (key == Key.ZERO) {
			resetoDefaults();
			UI.cleanUI();
			UI.el.querySelector("select").value = 0;
		} else if (key == Key.S) {
			UI.saveSequence();
		} else {
			console.warn("Your key is not on the list: ", key);
		}
	}


	UI.cleanUI = function() {
		var td = UI.el.querySelectorAll(".scheduled");
		for (var i = 0; i < td.length; i++) {
			td[i].classList.remove("scheduled");
		}
	}

	UI.addKeyframe = function(entry, frameid) {
		if (frameid === undefined || entry === undefined) return;
		var td = UI.el.querySelector("tr.entry_" + entry + " .frame_" + frameid);
		td.classList.add("scheduled");
	}


	UI.updateInterface = function(frame, action) {
		var row = UI.el.querySelector("tr.active")
		if (row !== null)
			row.classList.remove("active");
		UI.el.querySelector(".entry_" + action.key).classList.add("active");

		var col = UI.el.querySelectorAll(".active_frame");
		for (var i = 0; i < col.length; i++) {
			col[i].classList.remove('active_frame');
		}

		var col = UI.el.querySelectorAll(".frame_" + frame);
		for (var i = 0; i < col.length; i++) {
			col[i].classList.add('active_frame');
		}
	}

	UI.loadSequences = function() {
		if (!window.localStorage) {
			console.warn("cant load, no local storage");
			return;
		}
		var counter = parseInt(localStorage.getItem('sequence_counter') || "0");
		for (var i = 0; i < counter; i++) {
			var name = localStorage.getItem("sequence_" + i + "_name");
			var sequence = localStorage.getItem("sequence_" + i + "_val");
			if (name === null || sequence === null) {
				console.warn("failed loading sequence " + i + ". name:", +name + " sequence: " + sequence);
			} else {
				addSequence(name, sequence);
			}

		}
	}

	UI.addSequence = function(name, value) {
		var opt = UI.createOption(name, value);
		var selection = UI.el.querySelector("select");
		selection.appendChild(opt);
	}

	UI.saveSequence = function() {
		if (!window.localStorage) {
			console.warn("cant save, no local storage");
			return;
		}
		var name = prompt("Please enter name for sequence", "my_sequence");
		if (name == null) { // user cancel
			return;
		}

		// now save sequence to local storage
		var value = moviequeue.map(function(a) {
			return a.key;
		}).join("");

		var counter = parseInt(localStorage.getItem('sequence_counter') || "0");

		localStorage.setItem("sequence_" + counter + "_name", name);
		localStorage.setItem("sequence_" + counter + "_val", value);
		addSequence(name, value);
		UI.addSequence(name, name);

		UI.el.querySelector("select").value = name;
		counter = counter + 1;
		localStorage.setItem("sequence_counter", counter);
	}

	// build functions
	// ----------------

	// render the keyframe table the the sequence selector
	UI.render = function(el) {
		el.classList.add('keyframe');
		UI.el = el;

		UI.createSequenceSelector(el);
		UI.createKeyFrameTable(el);
		UI.createManual(el);

	}

	UI.createManual = function(el) {
		var div = document.createElement('div');
		div.classList.add('manual');

		div.innerHTML = "\
		You can interact with the animation by pressing different keys:\
		<ul><li><em>ENTER</em>: plays the sequence of key frames</li>\
		<li> <em>SPACE</em>: pause/resume the sequence that is running</li>\
		<li> <em>0</em>: cleans/deletes all the keyframes</li>\
		<li> <em>S</em>: prompt to save current sequence to local storage</li>\
		</ul>\
		<p>If you press any of keys indicated next to each <em>action</em> a new keyframe will be added.\
		The canvas will show the animation for that key.</p>";

		el.appendChild(div);

	}
	UI.createSequenceSelector = function(el) {
		var div = document.createElement('div');
		div.classList.add('sequence');
		div.innerHTML = 'Select a preloaded sequence:';

		var select = document.createElement('select');
		select.onchange = function() {
			if (this.value != 0) {
				loadSequence(this.value)
			} else {
				resetoDefaults();
				UI.cleanUI();
			}
		};

		// default option
		var opt = UI.createOption("--", 0);
		select.appendChild(opt);

		for (var name in sequences) {
			var opt = UI.createOption(name, name);
			select.appendChild(opt);
		}

		el.appendChild(div);
		div.appendChild(select);
	}

	UI.createOption = function(name, val) {
		var opt = document.createElement('option');
		opt.value = val;
		opt.innerHTML = name;
		return opt;

	};

	UI.createKeyFrameTable = function(el) {
		var table = document.createElement('table');
		el.appendChild(table);
		for (var name in animations) {
			var row = UI.createRow(animations[name]);
			table.appendChild(row);
		}
	};

	UI.createRow = function(entry) {
		var row = document.createElement('tr');
		row.classList.add("entry_" + entry.key);

		var th = document.createElement('th');
		th.innerHTML = " (" + entry.key + ") " + entry.name;
		row.appendChild(th);
		for (var i = 0; i < NUM_FRAMES; i++) {
			var td = document.createElement('td');
			if (i % 10 == 0) {
				td.classList.add('tenth');
			}
			td.classList.add('frame_' + i);
			row.appendChild(td);
		}
		return row;
	};



	/* Math interpolation functions
	 * ----------------------------- */

	var easyCurve = function(t) {
		return (3 - 2 * t) * t * t;
	}

	var lerp = function(t, a, b) {
		return a + t * (b - a);
	};

	return {
		addAnimation: addAnimation,
		addSequence: addSequence,
		loadLocalSequences: UI.loadSequences,
		initialStatus: setInitialKeyFrame,
		update: update,
		render: UI.render,
		loadSequence: loadSequence
	}
})();