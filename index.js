  'use strict';
/*!
 * Adds dynamically-updated docs as /explorer
 */
var path = require('path');
var urlJoin = require('./lib/url-join');
var _defaults = require('lodash.defaults');
var express = require('express');
var swagger = require('./lib/swagger');
var SWAGGER_UI_ROOT = path.join(__dirname, 'node_modules', 
  'swagger-ui', 'dist');
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
    resourcePath: 'resources',
    apiInfo: loopbackApplication.get('apiInfo') || {},
    preMiddleware: []
  });

  var app = express();

  swagger(loopbackApplication, app, options);

  // Allow the user to attach middleware that will run before any
  // explorer routes, e.g. for access control.
  if (typeof options.preMiddleware === 'function' || 
      (Array.isArray(options.preMiddleware) && options.preMiddleware.length)) {
    app.use(options.preMiddleware);
  }

  app.disable('x-powered-by');

  // config.json is loaded by swagger-ui. The server should respond
  // with the relative URI of the resource doc.
  app.get('/config.json', function(req, res) {
    var resourcePath = req.originalUrl.replace(/\/config.json(\?.*)?$/, 
      urlJoin('/', options.resourcePath));
    res.send({
      url: resourcePath
    });
  });

  // Allow specifying a static file root for swagger files. Any files in 
  // that folder will override those in the swagger-ui distribution. 
  // In this way one could e.g. make changes to index.html without having 
  // to worry about constantly pulling in JS updates.
  if (options.swaggerDistRoot) {
    app.use(express.static(options.swaggerDistRoot));
  }
  // File in node_modules are overridden by a few customizations
  app.use(express.static(STATIC_ROOT));
  // Swagger UI distribution
  app.use(express.static(SWAGGER_UI_ROOT));

  return app;
}
