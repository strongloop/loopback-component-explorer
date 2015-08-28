'use strict';

var assert = require('assert');
var typeConverter = require('./type-converter');

var TYPES_PRIMITIVE = [
  'boolean',
  'integer',
  'number',
  'null',
  'string',
  'object',
  'array'
];

var KEY_TRANSLATIONS = {
  // LDL : Swagger
  min: 'minimum',
  max: 'maximum',
  length: 'maxLength',
};

var SWAGGER_DATA_TYPE_FIELDS = [
  'format',
  'default',
  'enum',
  'minimum',
  'minItems',
  'minLength',
  'maximum',
  'maxItems',
  'maxLength',
  'uniqueItems',
  'pattern'
];

/**
 * Build a Swagger Schema Object and/or Parameter Object from LoopBack
 * type descriptor.
 *
 * @param {String|Function|Array|Object} ldlDef The loopback type to convert,
 *  the value should be one of the following:
 *   - a string value (type name), e.g. `'string'` or `'MyModel'`
 *   - a constructor function, e.g. `String` or `MyModel`
 *   - an array of a single item in `lbType` format
 *   - an object containing a `type` property with string/function/array value
 *     and validation fields like `length` or `max`
 * @param {TypeRegistry} typeRegistry The registry of known types and models.
 * @returns {Object} Swagger Schema Object that can be used as `schema` field
 *   or as a base for Parameter Object.
 */
exports.buildFromLoopBackType = function(ldlDef, typeRegistry) {
  assert(!!typeRegistry, 'typeRegistry is a required parameter');

  // Normalize non-object values to object format `{ type: XYZ }`
  if (typeof ldlDef === 'string' || typeof ldlDef === 'function') {
    ldlDef = { type: ldlDef };
  } else if (Array.isArray(ldlDef)) {
    ldlDef = { type: ldlDef };
  }

  var schema = exports.buildMetadata(ldlDef);
  var ldlType = exports.getLdlTypeName(ldlDef.type);

  if (Array.isArray(ldlType)) {
    var itemLdl = ldlType[0] || 'any';
    var itemSchema = exports.buildFromLoopBackType(itemLdl, typeRegistry);
    schema.type = 'array';
    schema.items = itemSchema;
    return schema;
  }

  var ldlTypeLowerCase = ldlType.toLowerCase();
  switch (ldlTypeLowerCase) {
    case 'date':
      schema.type = 'string';
      schema.format = 'date';
      break;
    case 'buffer':
      schema.type = 'string';
      schema.format = 'byte';
      break;
    case 'number':
      schema.type = 'number';
      schema.format = schema.format || 'double'; // All JS numbers are doubles
      break;
    case 'any':
      schema.$ref = typeRegistry.reference('x-any');
      break;
    default:
      if (exports.isPrimitiveType(ldlTypeLowerCase)) {
        schema.type = ldlTypeLowerCase;
      } else {
        // TODO - register anonymous types
        schema.$ref = typeRegistry.reference(ldlType);
      }
  }
  return schema;
};

/**
 * @param {String|Function|Array|Object} ldlType LDL type
 * @returns {String|Array} Type name
 */
exports.getLdlTypeName = function(ldlType) {
  // Value "array" is a shortcut for `['any']`
  if (ldlType === 'array') {
    return ['any'];
  }

  if (typeof ldlType === 'string') {
    var arrayMatch = ldlType.match(/^\[(.*)\]$/);
    return arrayMatch ? [arrayMatch[1]] : ldlType;
  }

  if (typeof ldlType === 'function') {
    return ldlType.modelName || ldlType.name;
  }

  if (Array.isArray(ldlType)) {
    return ldlType;
  }

  if (typeof ldlType === 'object') {
    // Anonymous objects, they are allowed e.g. in accepts/returns definitions
    // TODO(bajtos) Build a named schema for this anonymous object
    return 'object';
  }

  if (ldlType === undefined) {
    return 'any';
  }

  console.error('Warning: unknown LDL type %j, using "any" instead', ldlType);
  return 'any';
};

/**
 * Convert validations and other metadata from LDL format to Swagger format.
 * @param {Object} ldlDef LDL property/argument definition,
 * for example `{ type: 'string', maxLength: 64 }`.
 * @return {Object} Metadata in Swagger format.
 */
exports.buildMetadata = function(ldlDef) {
  var result = {};
  var key;

  for (key in KEY_TRANSLATIONS) {
    if (key in ldlDef)
      result[KEY_TRANSLATIONS[key]] = ldlDef[key];
  }

  for (var ix in SWAGGER_DATA_TYPE_FIELDS) {
    key = SWAGGER_DATA_TYPE_FIELDS[ix];
    if (key in ldlDef)
      result[key] = ldlDef[key];
  }

  if (ldlDef.description) {
    result.description = typeConverter.convertText(ldlDef.description);
  } else if (ldlDef.doc) {
    result.description = typeConverter.convertText(ldlDef.doc);
  }

  return result;
};

exports.isPrimitiveType = function(typeName) {
  return TYPES_PRIMITIVE.indexOf(typeName.toLowerCase()) !== -1;
};
