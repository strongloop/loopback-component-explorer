'use strict';

/**
 * Module dependencies.
 */
var path = require('path');
var _ = require('lodash');
var routeHelper = require('./route-helper');
var modelHelper = require('./model-helper');
var cors = require('cors');
var typeConverter = require('./type-converter');
var tagBuilder = require('./tag-builder');
var TypeRegistry = require('./type-registry');

/**
 * Create Swagger Object describing the API provided by loopbacApplication.
 *
 * @param {Application} loopbackApplication The application to document.
 * @param {Object} opts Options.
 * @returns {Object}
 */
exports.createSwaggerObject = function(loopbackApplication, opts) {
  opts = _.defaults(opts || {}, {
    basePath: loopbackApplication.get('restApiRoot') || '/api',
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
    version: getPackagePropertyOrDefault('version', '1.0.0'),
  });

  // We need a temporary REST adapter to discover our available routes.
  var remotes = loopbackApplication.remotes();
  var adapter = remotes.handler('rest').adapter;
  var routes = adapter.allRoutes();
  var classes = remotes.classes();

  // Generate fixed fields like info and basePath
  var swaggerObject = generateSwaggerObjectBase(opts);

  var typeRegistry = new TypeRegistry();
  var loopbackRegistry = loopbackApplication.registry ||
                         loopbackApplication.loopback.registry ||
                         loopbackApplication.loopback;
  var models = loopbackRegistry.modelBuilder.models;
  for (var modelName in models) {
    modelHelper.registerModelDefinition(models[modelName], typeRegistry);
  }

  // A class is an endpoint root; e.g. /users, /products, and so on.
  // In Swagger 2.0, there is no endpoint roots, but one can group endpoints
  // using tags.
  classes.forEach(function(aClass) {
    if (!aClass.name) return;

    var hasDocumentedMethods = aClass.methods().some(function(m) {
      return m.documented;
    });
    if (!hasDocumentedMethods) return;

    swaggerObject.tags.push(tagBuilder.buildTagFromClass(aClass));
  });

  // A route is an endpoint, such as /users/findOne.
  routes.forEach(function(route) {
    if (!route.documented) return;

    // Get the class definition matching this route.
    var className = route.method.split('.')[0];
    var classDef = classes.filter(function(item) {
      return item.name === className;
    })[0];

    if (!classDef) {
      console.error('Route exists with no class: %j', route);
      return;
    }

    routeHelper.addRouteToSwaggerPaths(route, classDef, typeRegistry,
                                       swaggerObject.paths);
  });

  _.assign(swaggerObject.definitions, typeRegistry.getDefinitions());

  loopbackApplication.emit('swaggerResources', swaggerObject);
  return swaggerObject;
};

/**
 * Setup Swagger documentation on the given express app.
 *
 * @param {Application} loopbackApplication The loopback application to
 * document.
 * @param {Application} swaggerApp Swagger application used for hosting
 * swagger documentation.
 * @param {Object} opts Options.
 */
exports.mountSwagger = function(loopbackApplication, swaggerApp, opts) {
  var swaggerObject = exports.createSwaggerObject(loopbackApplication, opts);

  var resourcePath = opts && opts.resourcePath || 'swagger.json';
  if (resourcePath[0] !== '/') resourcePath = '/' + resourcePath;

  var remotes = loopbackApplication.remotes();
  setupCors(swaggerApp, remotes);

  swaggerApp.get(resourcePath, function sendSwaggerObject(req, res) {
    res.status(200).send(swaggerObject);
  });
};

/**
 * Generate a top-level resource doc. This is the entry point for swagger UI
 * and lists all of the available APIs.
 * @param  {Object} opts Swagger options.
 * @return {Object}      Resource doc.
 */
function generateSwaggerObjectBase(opts) {
  var apiInfo = _.cloneDeep(opts.apiInfo) || {};
  for (var propertyName in apiInfo) {
    var property = apiInfo[propertyName];
    apiInfo[propertyName] = typeConverter.convertText(property);
  }
  apiInfo.version = String(apiInfo.version || opts.version);
  if (!apiInfo.title) {
    apiInfo.title = getPackagePropertyOrDefault('name', 'LoopBack Application');
  }

  var basePath = opts.basePath;
  if (basePath && /\/$/.test(basePath))
    basePath = basePath.slice(0, -1);

  return {
    swagger: '2.0',
    // See swagger-spec/2.0.md#infoObject
    info: apiInfo,
    host: opts.host,
    basePath: basePath,
    schemes: opts.protocol ? [opts.protocol] : undefined,
    consumes: opts.consumes,
    produces: opts.produces,
    paths: {},
    definitions: opts.models || {},
    // TODO Authorizations (security, securityDefinitions)
    // TODO: responses, externalDocs
    tags: []
  };
}

function setupCors(swaggerApp, remotes) {
  var corsOptions = remotes.options && remotes.options.cors ||
    { origin: true, credentials: true };

  // TODO(bajtos) Skip CORS when remotes.options.cors === false
  swaggerApp.use(cors(corsOptions));
}

function getPackagePropertyOrDefault(name, defautValue) {
  try {
    var pkg = require(path.join(process.cwd(), 'package.json'));
    return pkg[name] || defautValue;
  } catch(e) {
    return defautValue;
  }
}
