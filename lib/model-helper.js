'use strict';

/**
 * Module dependencies.
 */

/**
 * Constants
 */

 // Keys that are different between LDL and Swagger
 var KEY_TRANSLATIONS = {
   // LDL : Swagger
   'doc': 'description',
   'default': 'defaultValue',
   'min': 'minimum',
   'max': 'maximum'
 };

/**
 * Export the modelHelper singleton.
 */
var modelHelper = module.exports = {
  /**
   * Given a class (from remotes.classes()), generate a model definition.
   * This is used to generate the schema at the top of many endpoints.
   * @param  {Class} class Remote class.
   * @return {Object}      Associated model definition.
   */
  generateModelDefinition: function generateModelDefinition(aClass) {
    var def = aClass.ctor.definition;
    var name = def.name;

    var required = [];

    // Iterate through each property in the model definition.
    // Types are defined as constructors (e.g. String, Date, etc.)
    // so we convert them to strings.
    Object.keys(def.properties).forEach(function(key) {
      var prop = def.properties[key];

      // Eke a type out of the constructors we were passed.
      prop.type = getPropType(prop.type);
      if (prop.type === 'array') {
        prop.items = {
          type: getPropType(prop.type[0])
        };
      }

      // Required props sit in a per-model array.
      if (prop.required || prop.id) {
        required.push(key);
      }

      // Change mismatched keys.
      Object.keys(KEY_TRANSLATIONS).forEach(function(LDLKey){
        var val = prop[LDLKey];
        if (val) {
          // Should change in Swagger 2.0
          if (LDLKey === 'min' || LDLKey === 'max') {
            val = String(val);
          }
          prop[KEY_TRANSLATIONS[LDLKey]] = val;
        }
        delete prop[LDLKey];
      });
    });

    var out = {};
    out[name] = {
      id: name,
      properties: def.properties,
      required: required
    };
    return out;
  }
};


/**
 * Given a propType (which may be a function, string, or array),
 * get a string type.
 * @param  {*} propType Prop type description.
 * @return {String}     Prop type string.
 */ 
function getPropType(propType) {
  if (typeof propType === "function") {
    propType = propType.name.toLowerCase();
  } else if(Array.isArray(propType)) {
    propType = 'array';
  }
  return propType;
}
