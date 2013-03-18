/**
 * Proxy topics to parent frame
 */
define([
	'dojo/topic'
], function (aspect, topic) {
	/**
	 * The thought process here is that this would still work with reporters like the HTML reporter, proxying the topics with and allowing the arguments to persist
	 */
	aspect.after(topic, 'publish', function () {
		parent.listener.apply(arguments);
	}, true);
});