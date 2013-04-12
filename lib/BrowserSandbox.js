define([
	'dojo-ts/lang',
	'dojo-ts/topic',
	'dojo-ts/on',
	'dojo-ts/Deferred'
], function (lang, topic, on, Deferred) {
	function BrowserSandbox(options) {
		// Do we want to see if it already exists?  Maybe use some sort of
		// unique identifer?
		var frameNode = document.createElement('iframe'),
			sandbox = this,
			onload;

		lang.mixin(this, options);
		document.body.appendChild(frameNode);
		this.frameNode = frameNode;
		this._messageHandle = on(window, 'message', function (event) {
			topic.publish(event.data[0], event.data[1]);
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

			this._onLoadHandle = on(this.frameNode, 'load', function () {
				sandbox._post('parent');
				dfd.resolve();
			});

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
			
			newFrame.src = 'lib/Sandbox.html?config=' + this.config;
			this._onLoadHandle.remove();
			parent.removeChild(currentFrame);
			parent.appendChild(newFrame);
			this.frameNode = newFrame;

			this._addOnLoad().then(function () {
				dfd.resolve();
			});

			return dfd.promise;
		},
		/**
		 * Loads a module with a provided path
		 */
		loadFromPath: function (path) {
			var sandbox = this;
			this.reset().then(function () {
				sandbox._injectScript(path);
			});
		},
		/**
		 * Injects a script node into the head of the frame's contentWindow.
		 * If options are passed, they will be set as attributes on the script node.
		 */
		_injectScript: function (path, options) {
			this._post({
				path: path,
				options: options
			});
		},
		/**
		 * Post a message to the sandbox frame.
		 */
		_post: function (message) {
			this.frameNode.contentWindow.postMessage(message, '*');
		}
	};

	return BrowserSandbox;
});