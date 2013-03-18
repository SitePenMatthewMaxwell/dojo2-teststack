define([
	'dojo/_base/declare',
	'dojo/dom-attr',
	'./Sandbox',
	'dijit/_TemplatedMixin',
	'dojo/text!./templates/BrowserSandbox.html',
	'dojo/topic'
], function (declare, domAttr, Sandbox, _TemplatedMixin, template, topic) {
	return declare([Sandbox, _TemplatedMixin], {
		buildRendering: function () {
			this.inherited(arguments);
			
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
			this._injectScript(path);
		},
		/**
		 * Injects a script node into the head of the frame's contentWindow.
		 * If options are passed, they will be set as attributes on the script node.
		 */
		_injectScript: function (path, options) {
			var script = document.createElement('script');
			script.src = path;
			
			if (options) {
				domAttr.set(script, options);
			}
			
			// TODO: Should we look for errors?  Should this be done in a deferred?
			this.frame.contentWindow.document.head.appendChild(script);
		}
	});
});