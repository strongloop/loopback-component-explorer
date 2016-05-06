// Copyright IBM Corp. 2014. All Rights Reserved.
// Node module: loopback-component-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

// Simple url joiner. Ensure we don't have to care about whether or not
// we are fed paths with leading/trailing slashes.
module.exports = function urlJoin() {
  var args = Array.prototype.slice.call(arguments);
  return args.join('/').replace(/\/+/g, '/');
};
