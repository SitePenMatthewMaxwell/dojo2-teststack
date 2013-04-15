define([
	'dojo-ts/aspect',
	'dojo-ts/topic',
], function (aspect, topic) {
	/**
	 * Post a message to the parent frame.
	 */
	function post(message) {
		parent.postMessage(JSON.stringify(message), '*');
	}

	/**
	 * Generate an error to the parent frame.
	 */
	function error(message) {
		// Do we want to actually throw as well?
		post({
			type: 'error',
			message: message,
			args: [].slice.call(arguments, 1, arguments.length)
		});
	}

	/**
	 * Publish a topic to the parent frame.
	 */
	function publish(message) {
		post({
			type: 'topic',
			args: [].slice.call(arguments, 1, arguments.length)
		});
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

	return {
		error: error,
		publish: publish
	};
});