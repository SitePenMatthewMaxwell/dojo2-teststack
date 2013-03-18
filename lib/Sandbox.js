define([
	'dojo/_base/declare',
	'dijit/_WidgetBase'
], function (declare, _WidgetBase) {
	return declare(_WidgetBase, {
		reset: function () {
			// stub
		},
		_setPathAttr: function (path) {
			this.reset();
			this.loadFromPath(path);
		},
		loadFromPath: function (path) {
			//stub
		}
	});
});