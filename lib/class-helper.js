'use strict';

/**
 * Module dependencies.
 */
var modelHelper = require('./model-helper');
var path = require('path');

/**
 * Export the classHelper singleton.
 */
var classHelper = module.exports = {
  // See below.
  addDynamicBasePathGetter: addDynamicBasePathGetter,
  /**
   * Given a remoting class, generate an API doc.
   * See https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#52-api-declaration
   * @param  {Class} aClass Strong Remoting class.
   * @param  {Object} opts Options (passed from Swagger(remotes, options))
   * @param  {String} opts.version API Version.
   * @param  {String} opts.swaggerVersion Swagger version.
   * @param  {String} opts.basePath Basepath (usually e.g. http://localhost:3000).
   * @param  {String} opts.resourcePath Resource path (usually /swagger/resources).
   * @return {Object}       API Declaration.
   */
  generateAPIDoc: function(aClass, opts) {
    return {
      apiVersion: opts.version,
      swaggerVersion: opts.swaggerVersion,
      basePath: opts.basePath,
      resourcePath: path.join('/', opts.resourcePath),
      apis: [],
      models: modelHelper.generateModelDefinition(aClass)
    };
  },
  /**
   * Given a remoting class, generate a reference to an API declaration.
   * This is meant for insertion into the Resource declaration.
   * See https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#512-resource-object
   * @param  {Class} aClass Strong Remoting class.
   * @return {Object}       API declaration reference.
   */
  generateResourceDocAPIEntry: function(aClass) {
    return {
      path: aClass.http.path,
      description: aClass.ctor.sharedCtor && aClass.ctor.sharedCtor.description
    };
  }
};

/**
 * There's a few forces at play that require this "hack". The Swagger spec
 * requires a `basePath` to be set at various points in the API/Resource
 * descriptions. However, we can't guarantee this path is either reachable or
 * desirable if it's set as a part of the options.
 *
 * The simplest way around this is to reflect the value of the `Host` HTTP
 * header as the `basePath`. Because we pre-build the Swagger data, we don't
 * know that header at the time the data is built. Hence, the getter function.
 * We can use a `before` hook to pluck the `Host`, then the getter kicks in to
 * return that path as the `basePath` during JSON serialization.
 *
 * @param {SharedClassCollection} remotes The Collection to register a `before`
 *                                        hook on.
 * @param {String} path                   The full path of the route to register
 *                                        a `before` hook on.
 * @param {Object} obj                    The Object to install the `basePath`
 *                                        getter on.
 */
function addDynamicBasePathGetter(remotes, path, obj) {
  var initialPath = obj.basePath || '';
  var basePath = String(obj.basePath) || '';

  if (!/^https?:\/\//.test(basePath)) {
    remotes.before(path, function (ctx, next) {
      var headers = ctx.req.headers;
      var host = headers.Host || headers.host;

      basePath = ctx.req.protocol + '://' + host + initialPath;

      next();
    });
  }

  return setter(obj);

  function getter() {
    return basePath;
  }

  function setter(obj) {
    return Object.defineProperty(obj, 'basePath', {
      configurable: false,
      enumerable: true,
      get: getter
    });
  }
}
