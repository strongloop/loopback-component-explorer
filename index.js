  'use strict';
/*!
 * Adds dynamically-updated docs as /explorer
 */
var path = require('path');
var _defaults = require('lodash.defaults');
var extend = require('util')._extend;
var loopback = require('loopback');
var express = requireLoopbackDependency('express');
var swagger = require('./lib/swagger');
var fs = require('fs');
var SWAGGER_UI_ROOT = path.join(__dirname, 'node_modules', 'swagger-ui', 'dist');
var STATIC_ROOT = path.join(__dirname, 'public');

module.exports = explorer;

/**
 * Example usage:
 *
 * var explorer = require('loopback-explorer');
 * app.use('/explorer', explorer(app, options));
 */

function explorer(loopbackApplication, options) {
  options = _defaults({}, options, {
    basePath: loopbackApplication.get('restApiRoot') || '',
    name: 'swagger',
    resourcePath: 'resources',
    apiInfo: loopbackApplication.get('apiInfo') || {}
  });

  swagger(loopbackApplication.remotes(), options);

  var app = express();

  app.disable('x-powered-by');

  app.get('/config.json', function(req, res) {
    res.send({
      url: path.join(options.basePath || '/', options.name, options.resourcePath)
    });
  });
  // Allow specifying a static file root for swagger files. Any files in that folder
  // will override those in the swagger-ui distribution. In this way one could e.g. 
  // make changes to index.html without having to worry about constantly pulling in
  // JS updates.
  if (options.swaggerDistRoot) {
    app.use(loopback.static(options.swaggerDistRoot));
  }
  // File in node_modules are overridden by a few customizations
  app.use(loopback.static(STATIC_ROOT));
  // Swagger UI distribution
  app.use(loopback.static(SWAGGER_UI_ROOT));
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
