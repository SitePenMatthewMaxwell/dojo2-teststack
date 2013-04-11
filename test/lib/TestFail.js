define([
	'teststack!tdd',
	'teststack/chai!assert'
], function (tdd, assert) {
	with (tdd) {
		suite('demo', function () {
			before(function () {
				var x = new jaskdjhaskdjhas();
			});

			test('#example', function () {
				assert.equal(true, false);
			});
		});
	}
});