define([
	'dojo-ts/aspect',
	'dojo-ts/topic',
	'dojo-ts/request/xhr',
	'../args',
	'require'
], function (aspect, topic, xhr, args, require) {
	var suiteNode = document.body,
		styleNode = document.createElement('style'),
		testNode;

	xhr.get('lib/reporters/html.css').then(function (styles) {
		// IE
		if (styleNode.styleSheet) {
			styleNode.styleSheet.cssText = styles;
		} else {
			styleNode.appendChild(document.createTextNode(styles));
		}
		
		document.head.appendChild(styleNode);
	});

	topic.subscribe('/suite/start', function (suite) {
		var oldSuiteNode = suiteNode;

		suiteNode = document.createElement('ol');
		suiteNode.className += ' suite';

		if (oldSuiteNode === document.body) {
			oldSuiteNode.appendChild(suiteNode);
		}
		else {
			var outerSuiteNode = document.createElement('li'),
				headerNode = document.createElement('div');

			headerNode.appendChild(document.createTextNode(suite.name));
			outerSuiteNode.appendChild(headerNode);
			outerSuiteNode.appendChild(suiteNode);
			oldSuiteNode.appendChild(outerSuiteNode);
		}
	});

	topic.subscribe('/test/start', function (test) {
		testNode = document.createElement('li');
		testNode.appendChild(document.createTextNode(test.name));
		suiteNode.appendChild(testNode);
	});

	topic.subscribe('/test/pass', function (test) {
		testNode.appendChild(document.createTextNode(' passed (' + test.timeElapsed + 'ms)'));
		testNode.className += ' pass';
	});

	topic.subscribe('/test/fail', function (test) {
		testNode.appendChild(document.createTextNode(' failed (' + test.timeElapsed + 'ms)'));
		testNode.className += ' fail';

		var errorNode = document.createElement('pre');
		errorNode.appendChild(document.createTextNode(test.error.stack));
		testNode.appendChild(errorNode);

		suiteNode.className += ' fail';
		suiteNode.parentNode.className += ' fail';
	});

	topic.subscribe('/suite/end', function () {
		if (!/\bfail\b/.test(suiteNode.className)) {
			suiteNode.className += ' pass';
			suiteNode.parentNode.className += ' pass';
		}
		
		suiteNode = suiteNode.parentNode;
	});
});