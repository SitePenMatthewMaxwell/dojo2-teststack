// TODO: Update dojo2-core everywhere
define([
	'dojo/_base/declare',
	'./Sandbox',
	'dojo/topic'
], function (declare, Sandbox, topic) {
	return declare(Sandbox, {
		constructor: function () {
			// Do we want to see if it already exists?  Maybe use some sort of
			// unique identifer?
			var frame = document.createElement('iframe');			
			document.body.appendChild(frame);
			this.frame = frame;
			
			// TOOD: Is this the best way to handle this?
			window.listener = function () {
				// Proxy publications
				topic.publish.apply(null, arguments);
			};
			
			if (this.path) {
				// Pre-loaded path.
				// I don't see this being used like this, but who knows.
				this._injectScript(this.path);
			}
			
			
		},
		/**
		 * Resets the iframe.  This will create a brand new iframe and 
		 * update the frame property of this widget
		 */
		reset: function () {
			var currentFrame = this.frame,
				parent = currentFrame.parentNode,
				newFrame = document.createElement('iframe');
			
			newFrame.src = "lib/Sandbox.html";
			parent.removeChild(currentFrame);
			parent.appendChild(newFrame);
			this.frame = newFrame;
		},
		/**
		 * Loads a module with a provided path
		 */
		loadFromPath: function (path) {
			this.inherited(arguments);
			// Do we want to save this path for any future uses?
			this._injectScript(path);
		},
		/**
		 * Injects a script node into the head of the frame's contentWindow.
		 * If options are passed, they will be set as attributes on the script node.
		 */
		_injectScript: function (path, options) {
			var script = document.createElement('script'),
				option;
			script.src = path;
			
			if (options) {
				for (option in options) {
					if (options.hasOwnProperty(option)) {
						script.setAttribute(option, options[option]);
					}
				}
			}
			
			// TODO: Should we look for errors?  Should this be done in a deferred?
			this.frame.contentWindow.document.head.appendChild(script);
		}
	});
});