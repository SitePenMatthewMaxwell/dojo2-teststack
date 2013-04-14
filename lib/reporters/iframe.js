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
	 * Proxy topics to parent frame
	 */
	aspect.after(topic, 'publish', function () {
		post({
			type: 'topic',
			args: [].slice.call(arguments)
		});
	}, true);

	return {
		post: post
	};
});