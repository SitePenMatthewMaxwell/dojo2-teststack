define([
	'dojo-ts/lang',
	'dojo-ts/topic',
	'dojo-ts/on',
	'dojo-ts/Deferred'
], function (lang, topic, on, Deferred) {
	var runPromise;

	/**
	 * Post a message to the sandbox frame.
	 */
	function post(message, iframe) {
		iframe.contentWindow.postMessage(JSON.stringify(message), '*');
	}

	function BrowserSandbox(options) {
		// Do we want to see if it already exists?  Maybe use some sort of
		// unique identifer? Do we care about running sandboxes concurrently?
		var frameNode = document.createElement('iframe'),
			sandbox = this,
			onload;

		lang.mixin(this, options);

		document.body.appendChild(frameNode);
		this.frameNode = frameNode;
		frameNode.style.display = 'none';

		this._messageHandle = on(window, 'message', function (event) {
			var data = JSON.parse(event.data);
			
			// Not entirely sure we should just console.log the data if it's not
			// a topic.
			if (data.type && data.type === 'topic') {
				topic.publish.apply(null, data.args);
			} else if (data.type === 'error') {
				console.error(data.message, data.args);
			} else {
				console.log(data);
			}
		});

		// Unsure if this is the best way to tell when everything is done.
		// Does this prematurely resolve the promise with nested suites?
		topic.subscribe('/suite/end', function () {
			runPromise.resolve();
		});

		onload = this._addOnLoad();

		if (this.path) {
			// Pre-loaded path.
			// I don't see this being used like this, but who knows.
			onload.then(function () {
				sandbox._injectScript(sandbox.path);	
			});
		}
	}

	BrowserSandbox.prototype = {
		/**
		 * Add onload handler for frame and set parent of the sandbox.
		 */
		_addOnLoad: function () {
			var sandbox = this,
				dfd = new Deferred();

			this._onLoadHandle = on(this.frameNode, 'load', dfd.resolve);

			return dfd.promise;
		},
		/**
		 * Resets the iframe.  This will create a brand new iframe and 
		 * update the frame property of this widget
		 */
		reset: function () {
			var currentFrame = this.frameNode,
				parent = currentFrame.parentNode,
				newFrame = document.createElement('iframe'),
				dfd = new Deferred();
			
			newFrame.src = 'lib/Sandbox.html?suite=' + this.path + '&config=' + this.config + '&isSandbox=true';
			this._onLoadHandle.remove();
			parent.removeChild(currentFrame);
			parent.appendChild(newFrame);
			this.frameNode = newFrame;
			newFrame.style.display = 'none';

			this._addOnLoad().then(dfd.resolve);

			return dfd.promise;
		},
		/**
		 * Loads a module with a provided path
		 */
		loadFromPath: function (path) {
			var sandbox = this;

			runPromise = new Deferred();

			this.path = path;
			this.reset().then(function () {
				sandbox._injectScript(path);
			});

			return runPromise.promise;
		},
		/**
		 * Injects a script node into the head of the frame's contentWindow.
		 * If options are passed, they will be set as attributes on the script node.
		 */
		_injectScript: function (path, options) {
			post({
				path: path,
				options: options,
				type: 'loadTest'
			}, this.frameNode);
		}
	};

	return BrowserSandbox;
});