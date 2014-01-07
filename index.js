/*!
 * Adds dynamically-updated docs as /explorer
 */
var path = require('path');
var extend = require('util')._extend;
var loopback = require('loopback');
var express = requireLoopbackDependency('express');
var STATIC_ROOT = path.join(__dirname, 'public');

module.exports = explorer;

/**
 * Example usage:
 *
 * var explorer = require('loopback-explorer');
 * app.use('/explorer', explorer(app, options));
 */

function explorer(loopbackApplication, options) {
  options = extend({}, options);
  options.basePath = options.basePath || loopbackApplication.get('restApiRoot');

  loopbackApplication.docs(options);

  var app = express();
  app.get('/config.json', function(req, res) {
    res.send({
      discoveryUrl: (options.basePath || '') + '/swagger/resources'
    });
  });
  app.use(loopback.static(STATIC_ROOT));

  loopbackApplication.once('start', function() {
    var baseUrl = 'http://' + this.get('host') + ':' + this.get('port');
    // `app.route` is filled by `expressApp.use(route, app)`, i.e.
    //   loopbackApplication.use('/explorer', explorer(loopbackApplication))
    // sets `app.route = '/explorer'`
    var explorerPath = app.route;
    console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
  });

  return app;
}

function requireLoopbackDependency(module) {
  try {
    return require('loopback/node_modules/' + module);
  } catch (err) {
    if (err.code !== 'MODULE_NOT_FOUND') throw err;
    try {
      // Dependencies may be installed outside the loopback module,
      // e.g. as peer dependencies. Try to load the dependency from there.
      return require(module);
    } catch (errPeer) {
      if (errPeer.code !== 'MODULE_NOT_FOUND') throw errPeer;
      // Rethrow the initial error to make it clear that we were trying
      // to load a module that should have been installed inside
      // "loopback/node_modules". This should minimise end-user's confusion.
      // However, such situation should never happen as `require('loopback')`
      // would have failed before this function was even called.
      throw err;
    }
  }
}
