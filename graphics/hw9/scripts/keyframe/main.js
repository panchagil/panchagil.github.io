KeyFrame = (function() {
	var frame = 0;
	var num_frames = 60;
	var LEFT = 37,
		RIGHT = 39;

	var handleKeyPress = function(event) {
		var id = event.which;
		if (id == LEFT) {
			frame = Math.max(0, frame - 1);
		} else if (id == RIGHT) {
			frame = Math.min(num_frames - 1, frame + 1);
		}

		console.log(frame);
		var keychar = String.fromCharCode(id);
		var action = this.keys[keychar];
		if (action !== undefined) {
			var actives = el.querySelector(".active_row");
			for (var i = 0; i < actives.length; i++) {
				actives[i].classList.remove("active_row");
			}

			el.querySelector(".entry_" + action).classList.add('active_row');
		}
	};

	var update = function(time) {
		var actives = el.querySelectorAll(".active");
		for (var i = 0; i < actives.length; i++) {
			actives[i].classList.remove("active");
		}

		var tdframes = el.querySelectorAll(".frame_" + frame);
		for (var j = 0; j < tdframes.length; j++) {
			tdframes[j].classList.add("active");
		}
	}

	var createTable = function(el) {
		el.classList.add('keyframe');
		var table = document.createElement('table');
		el.appendChild(table);
		return table;
	};

	var createRow = function(table, entry) {
		var row = document.createElement('tr');
		row.classList.add("entry_" + entry.key);

		var th = document.createElement('th');
		th.innerHTML = entry.description + " " + entry.key;
		row.appendChild(th);
		for (var i = 0; i < num_frames; i++) {
			var td = document.createElement('td');
			if (i % 10 == 0) {
				td.classList.add('tenth');
			}
			td.classList.add('frame_' + i);
			row.appendChild(td);
		}
		table.appendChild(row);

	};

	var KeyFrame = function(el, actions) {
		startTime = (new Date).getTime();
		this.el = el;

		var table = createTable(el);
		// 
		this.keys = {}
		for (var id in actions) {
			var action = actions[id];
			var entry = {
				description: action.description,
				startCallback: action.activate,
				endCallback: action.end,
				key: action.key
			}
			this.keys[action.key] = entry;
			createRow(table, entry);
		}

		this.handleKeyPress = handleKeyPress;

		var _ = this;
		document.onkeydown = function(event) {
			_.handleKeyPress.call(_, event);
		};

		KeyFrame.update = update;
	}

	return KeyFrame;
})();