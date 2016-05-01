'use strict';
/*!
 * Adds dynamically-updated docs as /explorer
 */
var url = require('url');
var path = require('path');
var urlJoin = require('./lib/url-join');
var _defaults = require('lodash').defaults;
var cors = require('cors');
var createSwaggerObject = require('loopback-swagger').generateSwaggerSpec;
var SWAGGER_UI_ROOT = require('strong-swagger-ui/index').dist;
var STATIC_ROOT = path.join(__dirname, 'public');

module.exports = explorer;
explorer.routes = routes;

/**
 * Example usage:
 *
 * var explorer = require('loopback-component-explorer');
 * explorer(app, options);
 */

function explorer(loopbackApplication, options) {
  options = _defaults({}, options, { mountPath: '/explorer' });
  loopbackApplication.use(options.mountPath, routes(loopbackApplication, options));
  loopbackApplication.set('loopback-component-explorer', options);
}

function routes(loopbackApplication, options) {
  var loopback = loopbackApplication.loopback;
  var loopbackMajor = loopback && loopback.version &&
  loopback.version.split('.')[0] || 1;

  if (loopbackMajor < 2) {
    throw new Error('loopback-component-explorer requires loopback 2.0 or newer');
  }

  options = _defaults({}, options, {
    resourcePath: 'swagger.json',
    apiInfo: loopbackApplication.get('apiInfo') || {},
    swaggerUI: true,
  });

  var router = new loopback.Router();

  mountSwagger(loopbackApplication, router, options);

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
      url: urlJoin(source, '/' + options.resourcePath),
    });
  });

  if (options.swaggerUI) {
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

    // File in node_modules are overridden by a few customizations
    router.use(loopback.static(STATIC_ROOT));

    // Swagger UI distribution
    router.use(loopback.static(SWAGGER_UI_ROOT));
  }

  return router;
}

/**
 * Setup Swagger documentation on the given express app.
 *
 * @param {Application} loopbackApplication The loopback application to
 * document.
 * @param {Application} swaggerApp Swagger application used for hosting
 * swagger documentation.
 * @param {Object} opts Options.
 */
function mountSwagger(loopbackApplication, swaggerApp, opts) {
  var swaggerObject = createSwaggerObject(loopbackApplication, opts);

  // listening to modelRemoted event for updating the swaggerObject
  // with the newly created model to appear in the Swagger UI.
  loopbackApplication.on('modelRemoted', function() {
    swaggerObject = createSwaggerObject(loopbackApplication, opts);
  });

  // listening to remoteMethodDisabled event for updating the swaggerObject
  // when a remote method is disabled to hide that method in the Swagger UI.
  loopbackApplication.on('remoteMethodDisabled', function() {
    swaggerObject = createSwaggerObject(loopbackApplication, opts);
  });

  var resourcePath = opts && opts.resourcePath || 'swagger.json';
  if (resourcePath[0] !== '/') resourcePath = '/' + resourcePath;

  var remotes = loopbackApplication.remotes();
  setupCors(swaggerApp, remotes);

  swaggerApp.get(resourcePath, function sendSwaggerObject(req, res) {
    res.status(200).send(swaggerObject);
  });
}

function setupCors(swaggerApp, remotes) {
  var corsOptions = remotes.options && remotes.options.cors ||
  { origin: true, credentials: true };

  // TODO(bajtos) Skip CORS when remotes.options.cors === false
  swaggerApp.use(cors(corsOptions));
}
