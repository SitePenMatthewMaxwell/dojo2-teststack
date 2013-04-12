define([
	'dojo-ts/aspect',
	'dojo-ts/topic',
	'dojo-ts/on',
	'require',
	'teststack/main'
], function (aspect, topic, on, require, main) {
	var parent, script, option, options;

	/**
	 * Post a message to the parent frame.
	 */
	function post(message) {
		parent.postMessage(JSON.stringify(message), '*');
	}

	/**
	 * Proxy topics to parent frame
	 */
	aspect.after(topic, 'publish', function () {
		post({
			type: 'topic',
			args: [].slice.call(arguments)
		});
	}, true);

	on(window, 'message', function (event) {
		var data = JSON.parse(event.data);

		if (data === 'parent') {
			parent = event.source;
			post('Sandbox initialized');
		} else {
			require(['teststack/client'], function () {
				post('Client loaded');
			});
		}
	});
});