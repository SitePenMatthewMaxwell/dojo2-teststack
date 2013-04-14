/*jshint node:true */
if (typeof process !== 'undefined' && typeof define === 'undefined') {
	(function () {
		var req = require('./dojo/dojo'),
			pathUtils = require('path');

		req({
			baseUrl: pathUtils.resolve(__dirname, '..'),
			packages: [
				{ name: 'dojo-ts', location: pathUtils.resolve(__dirname, 'dojo') },
				{ name: 'teststack', location: __dirname },
				{ name: 'chai', location: pathUtils.resolve(__dirname, 'chai'), main: 'chai' }
			]
		}, [ 'teststack/client' ]);
	})();
}
else {
	define([
		'./main',
		'./lib/args',
		'./lib/reporterManager',
		'./lib/Suite',
		'dojo-ts/topic',
		'require'
	], function (main, args, reporterManager, Suite, topic, require) {
		if (!args.config && !args.suite) {
			throw new Error('Missing "config" and "suite" argument');
		}

		require([ args.config ], function (config) {
			// TODO: Use of the global require is required for this to work because config mechanics are in global
			// require only in the Dojo loader; this should probably not be the case
			this.require(config.loader);

			if (!args.suites) {
				args.suites = config.suites;
			}

			// args.suites might be an array or it might be a scalar value but we always need deps to be a fresh array.
			var deps = [].concat(args.suite || args.suites);

			// TODO: This is probably a fatal condition and so we need to let the runner know that no more information
			// will be forthcoming from this client
			if (typeof window !== 'undefined') {
				window.onerror = function (message, url, lineNumber) {
					var error = new Error(message + ' at ' + url + ':' + lineNumber);
					topic.publish('/error', error);
					topic.publish('/client/end', args.sessionId);
				};
			}
			else if (typeof process !== 'undefined') {
				process.on('uncaughtException', function (error) {
					topic.publish('/error', error);
				});
			}
			
			if (!args.isSandbox) {
				if (!args.reporters) {
					if (config.reporters) {
						args.reporters = config.reporters;
					}
					else {
						console.info('Defaulting to "console" reporter');
						args.reporters = 'console';
					}
				}

				args.reporters = [].concat(args.reporters).map(function (reporterModuleId) {
					// Allow 3rd party reporters to be used simply by specifying a full mid, or built-in reporters by
					// specifying the reporter name only
					if (reporterModuleId.indexOf('/') === -1) {
						reporterModuleId = './lib/reporters/' + reporterModuleId;
					}
					return reporterModuleId;
				});

				deps = deps.concat(args.reporters);
			}

			if (!args.sandbox) {
				// Client interface has only one environment, the current environment, and cannot run functional tests on
				// itself
				if (args.isSandbox) {
					main.suites.push(new Suite({ name: 'sandbox for ' + args.suite, sessionId: args.sessionId }));
				} else {
					main.suites.push(new Suite({name: 'main', sessionId: args.sessionId }));
				}

				var req, basePath, reqConfig, reqArgs;

				var factory = function () {
					if (!args.isSandbox) {
						// A hash map, { reporter module ID: reporter definition }
						var reporters = [].slice.call(arguments, arguments.length - args.reporters.length).reduce(function (map, reporter, i) {
							map[args.reporters[i]] = reporter;
							return map;
						}, {});
						
						reporterManager.add(reporters);
					}

					if (args.autoRun !== 'false') {
						main.run();
					}
				};

				if (args.isSandbox) {
					req = this.require;
					var basePath = location.pathname.replace(/[^\/]+$/, '') + '../';

					reqConfig = {
						baseUrl: basePath,
						packages: [
							{ name: 'dojo-ts', location: basePath + 'dojo' },
							{ name: 'teststack', location: basePath },
							{ name: 'chai', location: basePath + 'chai', main: 'chai' },
							{ name: 'dojo2-teststack', location: basePath }
						]
					}

					reqArgs = [reqConfig, deps, factory];
				} else {
					req = require;
					reqArgs = [deps, factory];
				}

				req.apply(this, reqArgs);
			} else {
				// We need to preserve the original suite paths that are found in the config file.
				// According to the comment above, this may mess up functional tests, but
				// we can cross that bridge when we come to it.
				require(deps, function () {
					// A hash map, { reporter module ID: reporter definition }
					var reporters = [].slice.call(arguments, arguments.length - args.reporters.length).reduce(function (map, reporter, i) {
						map[args.reporters[i]] = reporter;
						return map;
					}, {});
					
					reporterManager.add(reporters);

					main.runSandboxed(args.suites, args.config);
				});
			}
		});
	});
}