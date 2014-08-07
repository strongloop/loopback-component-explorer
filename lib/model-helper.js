'use strict';

/**
 * Module dependencies.
 */
var _cloneDeep = require('lodash.clonedeep');
var translateDataTypeKeys = require('./translate-data-type-keys');

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
    var processType = function(app, modelName, out) {
      if (modelName) {
        if (modelName.indexOf('[') == 0) {
          modelName = modelName.replace(/[\[\]]/g, '');
        }
        var model = app.models[modelName];
        if (model) {
          generateModelDefinition(model, out);
        }
      }
    }

    var def = modelClass.definition;
    var name = def.name;
    var out = definitions || {};
    if (out[name]) {
      // The model is already included
      return out;
    }
    var required = [];
    // Don't modify original properties.
    var properties = _cloneDeep(def.rawProperties);

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
      prop = modelHelper.LDLPropToSwaggerDataType(prop);
      processType(modelClass.app, prop.type, out);
      if (prop.items) {
        processType(modelClass.app, prop.items.type, out);
      }

      // Required props sit in a per-model array.
      if (prop.required || (prop.id && !prop.generated)) {
        required.push(key);
      }

      // Change mismatched keys.
      prop = translateDataTypeKeys(prop);

      // Assign this back to the properties object.
      properties[key] = prop;
    });

    out[name] = {
      id: name,
      properties: properties,
      required: required
    };

    // Generate model definitions for related models
    for (var r in modelClass.relations) {
      var rel = modelClass.relations[r];
      generateModelDefinition(rel.modelTo, out);
      if (rel.modelThrough) {
        generateModelDefinition(rel.modelThrough, out);
      }
    }

    var remotes = modelClass.sharedClass.methods();
    for (var remoteIdx in remotes) {
      var remote = remotes[remoteIdx];
      var returns = remote.returns;
      if (returns) {
        for (var returnIdx in returns) {
          processType(modelClass.app, returns[returnIdx].type, out);
        }
      }
      var errors = remote.errors;
      if (errors) {
        for (var errorIdx in errors) {
          processType(modelClass.app, errors[errorIdx].responseModel, out);
        }
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
      propType = propType.name.toLowerCase();
    } else if(Array.isArray(propType)) {
      propType = 'array';
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
  LDLPropToSwaggerDataType: function LDLPropToSwaggerDataType(prop) {
    var out = _cloneDeep(prop);
    out.type = modelHelper.getPropType(out.type);

    if (out.type === 'array') {
      var hasItemType = Array.isArray(prop.type) && prop.type.length;
      var arrayItem = hasItemType && prop.type[0];

      if (arrayItem) {
        if(typeof arrayItem === 'object') {
          out.items = modelHelper.LDLPropToSwaggerDataType(arrayItem);
        } else {
          out.items = { type: modelHelper.getPropType(arrayItem) };
        }
      } else {
        // NOTE: `any` is not a supported type in swagger 1.2
        out.items = { type: 'any' };
      }
    } else if (out.type === 'date') {
      out.type = 'string';
      out.format = 'date';
    } else if (out.type === 'buffer') {
      out.type = 'string';
      out.format = 'byte';
    } else if (out.type === 'number') {
      out.format = 'double'; // Since all JS numbers are doubles
    }
    return out;
  }
};



