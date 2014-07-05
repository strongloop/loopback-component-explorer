'use strict';
/**
 * Expose the `Swagger` plugin.
 */
module.exports = Swagger;

/**
 * Module dependencies.
 */
var Remoting = require('strong-remoting');
var debug = require('debug')('loopback-explorer:swagger');
var path = require('path');
var _defaults = require('lodash.defaults');
var classHelper = require('./class-helper');
var modelHelper = require('./model-helper');
var routeHelper = require('./route-helper');

/**
 * Create a remotable Swagger module for plugging into `RemoteObjects`.
 */
function Swagger(remotes, opts) {
  opts = _defaults({}, opts, {
    name: 'swagger',
    swaggerVersion: '1.2',
    resourcePath: 'resources',
    version: getVersion(),
    basePath: '/'
  });

  // We need a temporary REST adapter to discover our available routes.
  var adapter = remotes.handler('rest').adapter;
  var routes = adapter.allRoutes();
  var classes = remotes.classes();

  // Create a new Remoting instance to host the swagger docs.
  var extension = {};
  var helper = Remoting.extend(extension);

  // These are the docs we will be sending from the /swagger endpoints.
  var resourceDoc = generateResourceDoc(opts);
  var apiDocs = {};

  // A class is an endpoint root; e.g. /users, /products, and so on.
  classes.forEach(function (aClass) {
    apiDocs[aClass.name] = classHelper.generateAPIDoc(aClass, opts);
    resourceDoc.apis.push(classHelper.generateResourceDocAPIEntry(aClass));

    // Add the getter for this doc.
    var docPath = path.join(opts.resourcePath, aClass.http.path);
    addRoute(helper, apiDocs[aClass.name], docPath);
    classHelper.addDynamicBasePathGetter(remotes, opts.name + '.' + docPath, apiDocs[aClass.name]);
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

    routeHelper.addRouteToAPIDeclaration(route, classDef, doc);
  });

  /**
   * The topmost Swagger resource is a description of all (non-Swagger) resources
   * available on the system, and where to find more information about them.
   */
  addRoute(helper, resourceDoc, opts.resourcePath);

  // Bind all the above routes to the endpoint at /#{name}.
  remotes.exports[opts.name] = extension;

  return extension;
}

/**
 * Add a route to this remoting extension.
 * @param {Remote} helper Remoting extension.
 * @param {Object} doc    Doc to serve.
 * @param {String} path   Path from which to serve the doc.
 */
function addRoute(helper, doc, path) {
  helper.method(getDoc, {
    path: path,
    returns: { type: 'object', root: true }
  });
  function getDoc(callback) {
    callback(null, doc);
  }
}

/**
 * Generate a top-level resource doc. This is the entry point for swagger UI
 * and lists all of the available APIs.
 * @param  {Object} opts Swagger options.
 * @return {Object}      Resource doc.
 */
function generateResourceDoc(opts) {
  return {
    swaggerVersion: opts.swaggerVersion,
    apiVersion: opts.version,
    apis: [],
    // See https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#513-info-object
    info: opts.apiInfo
    // TODO Authorizations
    // https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#514-authorizations-object
    // TODO Produces/Consumes
    // https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#52-api-declaration
  };
}

/**
 * Attempt to get the current API version from package.json.
 * @return {String} API Version.
 */
function getVersion() {
  var version;
  try {
    version = require(path.join(process.cwd(), 'package.json')).version;
  } catch(e) {
    version = '';
  }
  return version;
}
