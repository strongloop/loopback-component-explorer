  'use strict';
/*!
 * Adds dynamically-updated docs as /explorer
 */
var url = require('url');
var path = require('path');
var urlJoin = require('./lib/url-join');
var _defaults = require('lodash').defaults;
var swagger = require('./lib/swagger');
var SWAGGER_UI_ROOT = require('strong-swagger-ui').dist;
var STATIC_ROOT = path.join(__dirname, 'public');

module.exports = explorer;
explorer.routes = routes;

/**
 * Example usage:
 *
 * var explorer = require('loopback-explorer');
 * explorer(app, options);
 */

function explorer(loopbackApplication, options) {
  var mountPath = options.mountPath || '/explorer';
  loopbackApplication.use(mountPath, routes(loopbackApplication, options));
}

function routes(loopbackApplication, options) {
  var loopback = loopbackApplication.loopback;
  var loopbackMajor = loopback && loopback.version &&
    loopback.version.split('.')[0] || 1;

  if (loopbackMajor < 2) {
    throw new Error('loopback-explorer requires loopback 2.0 or newer');
  }

  options = _defaults({}, options, {
    resourcePath: 'resources',
    apiInfo: loopbackApplication.get('apiInfo') || {}
  });

  var router = new loopback.Router();

  swagger(loopbackApplication, router, options);

  // config.json is loaded by swagger-ui. The server should respond
  // with the relative URI of the resource doc.
  router.get('/config.json', function(req, res) {
    // Get the path we're mounted at. It's best to get this from the referer
    // in case we're proxied at a deep path.
    var source = url.parse(req.headers.referer || '').pathname;
    // If no referer is available, use the incoming url.
    if (!source) {
      source = req.originalUrl.replace(/\/config.json(\?.*)?$/, '');
    }
    res.send({
      url: urlJoin(source, '/' + options.resourcePath)
    });
  });

  // Allow specifying a static file roots for swagger files. Any files in
  // these folders will override those in the swagger-ui distribution.
  // In this way one could e.g. make changes to index.html without having
  // to worry about constantly pulling in JS updates.
  if (options.uiDirs) {
    if (typeof options.uiDirs === 'string') {
      router.use(loopback.static(options.uiDirs));
    } else if (Array.isArray(options.uiDirs)) {
      options.uiDirs.forEach(function(dir) {
        router.use(loopback.static(dir));
      });
    }
  }

  if (options.swaggerDistRoot) {
    console.warn('loopback-explorer: `swaggerDistRoot` is deprecated,' +
      ' use `uiDirs` instead');
    router.use(loopback.static(options.swaggerDistRoot));
  }

  // File in node_modules are overridden by a few customizations
  router.use(loopback.static(STATIC_ROOT));

  // Swagger UI distribution
  router.use(loopback.static(SWAGGER_UI_ROOT));

  return router;
}
