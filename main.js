// TODO: dojo2-core should be used everywhere (dojo-ts)

define([
	'require',
	'dojo-ts/Deferred',
	'dojo-ts/topic',
	'./lib/util',
	'dojo-ts/has!host-browser?./lib/BrowserSandbox:./lib/NodeSandbox',
	'dojo-ts/on'
], function (require, Deferred, topic, util, Sandbox, on) {
	return {
		/**
		 * Maximum number of suites to run concurrently. Currently used only by the server-side runner.
		 */
		maxConcurrency: Infinity,

		/**
		 * Suites to run. Each suite defined here corresponds to a single environment.
		 */
		suites: [],
		/**
		 * Run all suites in a sandbox.  Currently, sandbox will be resused for every suite (after being reset)
		 */
		runSandboxed: function (paths, config) {
			var sandbox = new Sandbox({
				config: config
			}),
			queue = paths.slice(0);

			function loadNextSuite() {
				var suite;

				if (queue.length) {
					suite = queue.splice(0,1);
					if (suite) {
						// It seems the loading is happening just a little too fast for everything to finish up.
						sandbox.loadFromPath(suite).then(function () {
							setTimeout(loadNextSuite, 100);
						});
					}
				}
			}

			loadNextSuite();
		},

		/**
		 * Runs all environmental suites concurrently, with a concurrency limit.
		 */
		run: function () {
			var dfd = new Deferred(),
				queue = util.createQueue(this.maxConcurrency),
				numSuitesCompleted = 0,
				numSuitesToRun = this.suites.length;

			this.suites.forEach(queue(function (suite) {
				return suite.run().always(function () {
					if (++numSuitesCompleted === numSuitesToRun) {
						dfd.resolve();
					}
					else {
						console.log('%d environments left to test', numSuitesToRun - numSuitesCompleted);
					}
				});
			}));

			return dfd.promise;
		},

		/**
		 * AMD plugin API interface for easy loading of test interfaces.
		 */
		load: function (id, parentRequire, callback) {
			require([ './lib/interfaces/' + id ], callback);
		}
	};
});