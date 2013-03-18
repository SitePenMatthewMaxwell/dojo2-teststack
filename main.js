// TODO: dojo2-core should be used everywhere (dojo-ts)

define([
	'require',
	'dojo-ts/Deferred',
	'dojo-ts/topic',
	'./lib/util',
	'dojo-ts/has!host-browser?./lib/BrowserSandbox:./lib/NodeSandbox',
	'dojo/_base/array'
], function (require, Deferred, topic, util, Sandbox, arrayUtil) {
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
		runSandboxed: function (paths) {
			// TODO: is this the best way to handle this?
			// Should we just go off of a fresh Sandbox instance every time?
			var sandbox = new Sandbox();
			
			// In theory, this should do whatever functionality they need, regardless of environment
			arrayUtil.forEach(paths, function (path) {
				// This functionality may need to happen in some sort of deferred
				// or queuing system.  It may cause the context to change too quickly.
				sandbox.loadFromPath(path);
			});
		},

		/**
		 * Runs all environmental suites concurrently, with a concurrency limit.
		 */
		run: function () {
			var dfd = new Deferred(),
				queue = util.createQueue(this.maxConcurrency),
				numSuitesCompleted = 0,
				numSuitesToRun = this.suites.length;

			this.suites.forEach(queue(function (suite) {;
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