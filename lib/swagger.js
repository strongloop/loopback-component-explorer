'use strict';
/**
 * Expose the `Swagger` plugin.
 */
module.exports = Swagger;

/**
 * Module dependencies.
 */
var path = require('path');
var urlJoin = require('./url-join');
var _defaults = require('lodash').defaults;
var classHelper = require('./class-helper');
var routeHelper = require('./route-helper');
var _cloneDeep = require('lodash').cloneDeep;
var modelHelper = require('./model-helper');
var cors = require('cors');
var typeConverter = require('./type-converter');
var swaggerConverter = require('swagger-converter');
var mainModule = require.main;
var pkg = require('pkginfo').read(mainModule).package;

/**
 * Create a remotable Swagger module for plugging into `RemoteObjects`.
 *
 * @param {Application} loopbackApplication Host loopback application.
 * @param {Application} swaggerApp Swagger application used for hosting
 *                                 these files.
 * @param {Object} opts Options.
 */
function Swagger(loopbackApplication, swaggerApp, opts) {
  if (opts && opts.swaggerVersion)
    console.warn('loopback-explorer\'s options.swaggerVersion is deprecated.');

  opts = _defaults(opts || {}, {
    swaggerVersion: '1.2',
    basePath: loopbackApplication.get('restApiRoot') || '/api',
    resourcePath: 'resources',
    v2resourcePath: 'resources/swagger2',
    // Default consumes/produces
    consumes: [
      'application/json',
      'application/x-www-form-urlencoded',
      'application/xml', 'text/xml'
    ],
    produces: [
      'application/json',
      'application/xml', 'text/xml',
      // JSONP content types
      'application/javascript', 'text/javascript'
    ],
    version: getVersion()
  });

  // We need a temporary REST adapter to discover our available routes.
  var remotes = loopbackApplication.remotes();
  var adapter = remotes.handler('rest').adapter;

  setupCors(swaggerApp, remotes);

  var routes = adapter.allRoutes();
  var classes = remotes.classes();

  // These are the docs we will be sending from the /swagger endpoints.
  var resourceDoc = generateResourceDoc(opts);
  var apiDocs = {};

  // A class is an endpoint root; e.g. /users, /products, and so on.
  classes.forEach(function (aClass) {
    var doc = apiDocs[aClass.name] = classHelper.generateAPIDoc(aClass, opts);
    var hasDocumented = false;
    var methods = aClass.methods()
    for (var methodKey in methods) {
      hasDocumented = methods[methodKey].documented;
      if (hasDocumented) {
        break;
      }
    }
    if (hasDocumented) {
      resourceDoc.apis.push(classHelper.generateResourceDocAPIEntry(aClass));
    }

    // Add the getter for this doc.
    var docPath = urlJoin(opts.resourcePath, aClass.http.path);
    addRoute(swaggerApp, docPath, doc, opts);
  });

  // A route is an endpoint, such as /users/findOne.
  routes.forEach(function(route) {
    // Get the API doc matching this class name.
    var className = route.method.split('.')[0];
    var doc = apiDocs[className];
    if (!doc) {
      console.error('Route exists with no class: %j', route);
      return;
    }
    // Get the class definition matching this route.
    var classDef = classes.filter(function (item) {
      return item.name === className;
    })[0];

    if (route.documented) {
      routeHelper.addRouteToAPIDeclaration(route, classDef, doc);
    }
  });

  // Add models referenced from routes (e.g. accepts/returns)
  Object.keys(apiDocs).forEach(function(className) {
    var classDoc = apiDocs[className];
    classDoc.apis.forEach(function(api) {
      api.operations.forEach(function(routeDoc) {
        routeDoc.parameters.forEach(function(param) {
          var type = param.type;
          if (type === 'array' && param.items)
            type = param.items.type;

          addTypeToModels(type);
        });

        if (routeDoc.type === 'array') {
          addTypeToModels(routeDoc.items.type);
        } else {
          addTypeToModels(routeDoc.type);
        }

        routeDoc.responseMessages.forEach(function(msg) {
          addTypeToModels(msg.responseModel);
        });

        function addTypeToModels(name) {
          if (!name || name === 'void') return;

          var model = loopbackApplication.models[name];
          if (!model) {
            var loopback = loopbackApplication.loopback;
            if (!loopback) return;

            if (loopback.findModel) {
              model = loopback.findModel(name); // LoopBack 2.x
            } else {
              model = loopback.getModel(name); // LoopBack 1.x
            }
          }
          if (!model) return;

          modelHelper.generateModelDefinition(model, classDoc.models);
        }
      });
    });
  });

  /**
   * The topmost Swagger resource is a description of all (non-Swagger)
   * resources available on the system, and where to find more
   * information about them.
   */
  addRoute(swaggerApp, opts.resourcePath, resourceDoc, opts);
  loopbackApplication.emit('swaggerResources', resourceDoc);

  var apiDocList = [];
  for (var i in apiDocs) {
    apiDocList.push(apiDocs[i]);
  }
  var v2doc = swaggerConverter(resourceDoc, apiDocList);
  addRoute(swaggerApp, opts.v2resourcePath, v2doc, opts, '2.0');
  loopbackApplication.emit('swaggerResourcesV2', v2doc);
}

function setupCors(swaggerApp, remotes) {
  var corsOptions = remotes.options && remotes.options.cors ||
    { origin: true, credentials: true };

  swaggerApp.use(cors(corsOptions));
}

/**
 * Add a route to this remoting extension.
 * @param {Application} app       Express application.
 * @param {String} uri            Path from which to serve the doc.
 * @param {Object} doc            Doc to serve.
 */
function addRoute(app, uri, doc, opts, version) {

  var hasBasePath = Object.keys(doc).indexOf('basePath') !== -1;
  var initialPath = doc.basePath || '';

  // Remove the trailing slash, see
  // https://github.com/strongloop/loopback-explorer/issues/48
  if (initialPath[initialPath.length-1] === '/')
    initialPath = initialPath.slice(0, -1);

  app.get(urlJoin('/', uri), function(req, res) {

    // There's a few forces at play that require this "hack". The Swagger spec
    // requires a `basePath` to be set in the API descriptions. However, we
    // can't guarantee this path is either reachable or desirable if it's set
    // as a part of the options.
    //
    // The simplest way around this is to reflect the value of the `Host` and/or
    // `X-Forwarded-Host` HTTP headers as the `basePath`.
    // Because we pre-build the Swagger data, we don't know that header at
    // the time the data is built.
    if (hasBasePath && version !== '2.0') {
      var headers = req.headers;
      // NOTE header names (keys) are always all-lowercase
      var proto = headers['x-forwarded-proto'] || opts.protocol || req.protocol;
      var prefix = opts.omitProtocolInBaseUrl ? '//' : proto + '://';
      var host = headers['x-forwarded-host'] || headers.host;
      doc.basePath = prefix + host + initialPath;
    }
    if (version === '2.0') {
      doc.host = req.hostname;
      doc.info.title = 'REST APIs for ' + pkg.name;
    }
    res.status(200).send(doc);
  });
}

/**
 * Generate a top-level resource doc. This is the entry point for swagger UI
 * and lists all of the available APIs.
 * @param  {Object} opts Swagger options.
 * @return {Object}      Resource doc.
 */
function generateResourceDoc(opts) {
  var apiInfo = _cloneDeep(opts.apiInfo);
  for (var propertyName in apiInfo) {
    var property = apiInfo[propertyName];
    apiInfo[propertyName] = typeConverter.convertText(property);
  }

  return {
    swaggerVersion: opts.swaggerVersion,
    apiVersion: opts.version,
    // See https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#513-info-object
    info: apiInfo,
    // TODO Authorizations
    // https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#514-authorizations-object
    consumes: ['application/json', 'application/xml', 'text/xml'],
    produces: ['application/json', 'application/javascript', 'application/xml', 'text/javascript', 'text/xml'],
    apis: [],
    models: opts.models
  };
}

/**
 * Attempt to get the current API version from package.json.
 * @return {String} API Version.
 */
function getVersion() {
  return pkg.version || '1.0.0';
}
