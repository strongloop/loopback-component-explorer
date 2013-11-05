/*!
 * Adds dynamically-updated docs as /explorer
 */
var path = require('path');
var loopback = require('loopback');
var swagger = require('loopback/node_modules/strong-remoting/ext/swagger');
var STATIC_ROOT = path.join(__dirname, 'public');

module.exports = explorer;

/**
 * Example usage:
 *
 * var explorer = require('loopback-explorer');
 * app.use('/explorer', explorer(app));
 */

function explorer(loopbackApplication, options) {
  var remotes = loopbackApplication.remotes();
  swagger(remotes, options);
  return loopback.static(STATIC_ROOT);
}
