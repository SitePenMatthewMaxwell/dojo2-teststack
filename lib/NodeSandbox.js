// TODO: How does the child context communicate to the parent context?

define([
	'dojo-ts/lang',
	'dojo-ts/topic'
], function (lang, topic) {
	function NodeSandbox() {
		this.vm = require('vm');
		// Maybe attaching reporter methods to the sandbox will provide a means
		// for the child context to communicate to the parent?
		this.sandbox = {
			notify: function () {
				// Proxy the publication to the parent context
				topic.publish.apply(null, arguments);
			}
		};
	}
	
	NodeSandbox.prototype = {
		reset: function () {
			// Clear out the old context and create a new one?
			this.context = this.vm.createContext(this.sandbox);
		},
		loadFromPath: function (path) {
			this.reset();
			// Do we want to store this path somewhere?
			this._loadScript(path);
		},
		_loadScript: function (path) {
			// Do we need to use dojo/text to pull in the contents of the module?
			// How can we sanitize the functionality prior to passing it to this method?
			// Do we even care about sanitation? (I hope so)
			
			// Not sure this is the best way to resolve the code for this suite
			require(['dojo-ts/text!' + path], lang.hitch(this, function (code) {
				// If we wind up saving the path, we could use it in the runInContext calls
				// which might be useful for stack traces.
				
				var vm = this.vm,
					context = this.context,
					script;
					
				// Set up an aspect.after on topic.publish to proxy subscription events
				// to the parent
				if (!this.setup) {
					script = vm.createScript('require(["dojo/aspect", "dojo/topic"], function (aspect, topic) { var context = this; aspect.after(topic, "publish", function () { this.notify.apply(null, arguments); }, true); });');
					script.runInContext(script, context);
					this.setup = true;
				}
				
				script = this.vm.createScript(code);
				script.runInContext(script, context);
			}));
		}
	};
});