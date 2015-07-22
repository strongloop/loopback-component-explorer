'use strict';

/**
 * Module dependencies.
 */
var _cloneDeep = require('lodash').cloneDeep;
var _pick = require('lodash').pick;
var translateDataTypeKeys = require('./translate-data-type-keys');
var TYPES_PRIMITIVE = ['array', 'boolean', 'integer', 'number', 'null', 'object', 'string', 'any'];
var typeConverter = require('./type-converter');

/**
 * Export the modelHelper singleton.
 */
var modelHelper = module.exports = {
  /**
   * Given a class (from remotes.classes()), generate a model definition.
   * This is used to generate the schema at the top of many endpoints.
   * @param  {Class} modelClass Model class.
   * @param {Object} definitions Model definitions
   * @return {Object} Associated model definition.
   */
  generateModelDefinition: function generateModelDefinition(modelClass, definitions) {
    var processType = function(app, modelName, referencedModels) {
      if (app && modelName) {
        if (modelName.indexOf('[') == 0) {
          modelName = modelName.replace(/[\[\]]/g, '');
        }
        var model = app.models[modelName];
        if (model && referencedModels.indexOf(model) === -1) {
          referencedModels.push(model);
        }
      }
    };

    var convertTypeTo$Ref = function convertTypeTo$Ref(prop){
      if (prop.type && TYPES_PRIMITIVE.indexOf(prop.type) === -1 ){
        prop.$ref = prop.type;
        delete prop.type;
      }
    };

    var def = modelClass.definition;
    var out = definitions || {};

    if (!def) {
      // The model does not have any definition, it was most likely
      // created as a placeholder for an unknown property type
      return out;
    }

    var name = def.name;
    if (out[name]) {
      // The model is already included
      return out;
    }
    var required = [];
    // Don't modify original properties.
    var properties = _cloneDeep(def.rawProperties || def.properties);

    var referencedModels = [];
    // Add models from settings
    if (def.settings && def.settings.models) {
      for (var m in def.settings.models) {
        var model = modelClass[m];
        if (typeof model === 'function' && model.modelName) {
          if (model && referencedModels.indexOf(model) === -1) {
            referencedModels.push(model);
          }
        }
      }
    }

    // Iterate through each property in the model definition.
    // Types may be defined as constructors (e.g. String, Date, etc.),
    // or as strings; getPropType() will take care of the conversion.
    // See more on types:
    // https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#431-primitives
    Object.keys(properties).forEach(function(key) {
      var prop = properties[key];

      // Hide hidden properties.
      if (modelHelper.isHiddenProperty(def, key)) {
        delete properties[key];
        return;
      }

      // Eke a type out of the constructors we were passed.
      var swaggerType = modelHelper.LDLPropToSwaggerDataType(prop);
      processType(modelClass.app, swaggerType.type, referencedModels);
      convertTypeTo$Ref(swaggerType);
      if (swaggerType.items) {
        processType(modelClass.app, swaggerType.items.type, referencedModels);
        convertTypeTo$Ref(swaggerType.items);
      }

      var desc = typeConverter.convertText(prop.description || prop.doc);
      if (desc) swaggerType.description = desc;

      // Required props sit in a per-model array.
      if (prop.required || (prop.id && !prop.generated)) {
        required.push(key);
      }

      // Change mismatched keys.
      prop = translateDataTypeKeys(prop);

      delete prop.required;
      delete prop.id;

      if (prop.description){
        prop.description = typeConverter.convertText(prop.description);
      }

      // Assign this back to the properties object.
      properties[key] = swaggerType;

      var propType = prop.type;
      if (typeof propType === 'function' && propType.modelName) {
        if (referencedModels.indexOf(propType) === -1) {
          referencedModels.push(propType);
        }
      }
      if (Array.isArray(propType) && propType.length) {
        var itemType = propType[0];
        if (typeof itemType === 'function' && itemType.modelName) {
          if (referencedModels.indexOf(itemType) === -1) {
            referencedModels.push(itemType);
          }
        }
      }
    });

    var additionalProperties = undefined;
    if (def.settings){
      var strict = def.settings.strict;
      additionalProperties = def.settings.additionalProperties;
      var notAllowAdditionalProperties = strict || (additionalProperties !== true);
      if (notAllowAdditionalProperties){
        additionalProperties = false;
      }
    }

    out[name] = {
      id: name,
      additionalProperties: additionalProperties,
      description: typeConverter.convertText(
        def.description || (def.settings && def.settings.description)),
      properties: properties,
      required: required
    };

    if (def.description){
      out[name].description = typeConverter.convertText(def.description);
    }

    // Generate model definitions for related models
    for (var r in modelClass.relations) {
      var rel = modelClass.relations[r];
      if (rel.modelTo && referencedModels.indexOf(rel.modelTo) === -1) {
        referencedModels.push(rel.modelTo);
      }
      if (rel.modelThrough && referencedModels.indexOf(rel.modelThrough) === -1) {
        referencedModels.push(rel.modelThrough);
      }
    }

    if (modelClass.sharedClass) {
      var remotes = modelClass.sharedClass.methods();
      for (var remoteIdx in remotes) {
        var remote = remotes[remoteIdx];
        var accepts = remote.accepts;
        if (accepts) {
          for (var acceptIdx in accepts) {
            processType(modelClass.app, accepts[acceptIdx].type, referencedModels);
          }
        }
        var returns = remote.returns;
        if (returns) {
          for (var returnIdx in returns) {
            processType(modelClass.app, returns[returnIdx].type, referencedModels);
          }
        }
        var errors = remote.errors;
        if (errors) {
          for (var errorIdx in errors) {
            processType(modelClass.app, errors[errorIdx].responseModel, referencedModels);
          }
        }
      }
    }

    for (var i = 0, n = referencedModels.length; i < n; i++) {
      if (referencedModels[i].definition) {
        generateModelDefinition(referencedModels[i], out);
      }
    }
    return out;
  },

  /**
   * Given a propType (which may be a function, string, or array),
   * get a string type.
   * @param  {*} propType Prop type description.
   * @return {String}     Prop type string.
   */
  getPropType: function getPropType(propType) {
    if (typeof propType === 'function') {
      // See https://github.com/strongloop/loopback-explorer/issues/32
      // The type can be a model class
      return propType.modelName || propType.name.toLowerCase();
    } else if (Array.isArray(propType)) {
      return 'array';
    } else if (typeof propType === 'object') {
      // Anonymous objects, they are allowed e.g. in accepts/returns definitions
      return 'object';
    }
    return propType;
  },

  isHiddenProperty: function(definition, propName) {
    return definition.settings &&
      Array.isArray(definition.settings.hidden) &&
      definition.settings.hidden.indexOf(propName) !== -1;
  },

  // Converts a prop defined with the LDL spec to one conforming to the 
  // Swagger spec.
  // https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#431-primitives
  LDLPropToSwaggerDataType: function LDLPropToSwaggerDataType(ldlType) {
    var SWAGGER_DATA_TYPE_FIELDS = [
      'format',
      'defaultValue',
      'enum',
      'items',
      'minimum',
      'minItems',
      'minLength',
      'maximum',
      'maxItems',
      'maxLength',
      'uniqueItems',
      // loopback-explorer extensions
      'length',
      // https://www.npmjs.org/package/swagger-validation
      'pattern'
    ];

    // Rename LoopBack keys to Swagger keys
    ldlType = translateDataTypeKeys(ldlType);

    // Pick only keys supported by Swagger
    var swaggerType = _pick(ldlType, SWAGGER_DATA_TYPE_FIELDS);

    swaggerType.type = modelHelper.getPropType(ldlType.type || ldlType);

    if (swaggerType.type === 'array') {
      var hasItemType = Array.isArray(ldlType.type) && ldlType.type.length;
      var arrayItem = hasItemType && ldlType.type[0];

      var newItems = null;
      if (arrayItem) {
        if(typeof arrayItem === 'object') {
          newItems = modelHelper.LDLPropToSwaggerDataType(arrayItem);
        } else {
          newItems = { type: modelHelper.getPropType(arrayItem) };
        }
      } else {
        // NOTE: `any` is not a supported type in swagger 1.2
        newItems = { type: 'any' };
      }
      if (typeof swaggerType.items !== 'object') {
        swaggerType.items = {};
      }
      for (var key in newItems) {
        swaggerType.items[key] = newItems[key];
      }
    } else if (swaggerType.type === 'date') {
      swaggerType.type = 'string';
      swaggerType.format = 'date';
    } else if (swaggerType.type === 'buffer') {
      swaggerType.type = 'string';
      swaggerType.format = 'byte';
    } else if (swaggerType.type === 'number') {
      swaggerType.format = 'double'; // Since all JS numbers are doubles
    }
    return swaggerType;
  }
};