'use strict';

var _ = require('lodash');

module.exports = TypeRegistry;

function TypeRegistry() {
  this._definitions = Object.create(null);
  this._referenced = Object.create(null);

  this.register('x-any', { properties: {} });
  // TODO - register GeoPoint and other built-in LoopBack types
}

TypeRegistry.prototype.register = function(typeName, definition) {
  this._definitions[typeName] = definition;
};

TypeRegistry.prototype.reference = function(typeName) {
  this._referenced[typeName] = true;
  return '#/definitions/' + typeName;
};

TypeRegistry.prototype.getDefinitions = function() {
  var defs = Object.create(null);
  for (var name in this._referenced) {
    if (this._definitions[name]) {
      defs[name] = _.cloneDeep(this._definitions[name]);
    } else {
      // https://github.com/strongloop/loopback-explorer/issues/71
      console.warn('Swagger: skipping unknown type %j.', name);
    }
  }
  return defs;
};

TypeRegistry.prototype.getAllDefinitions = function() {
  return _.cloneDeep(this._definitions);
};

TypeRegistry.prototype.isDefined = function(typeName) {
  return typeName in this._definitions;
};
