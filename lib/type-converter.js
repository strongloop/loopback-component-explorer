var typeConverter = module.exports = {

  /**
   * Convert a text value that can be expressed either as a string or
   * as an array of strings.
   * @param {string|Array} value
   * @returns {string}
   */
  convertText: function(value) {
    if (Array.isArray(value))
      return value.join('\n');
    return value;
  }
};
