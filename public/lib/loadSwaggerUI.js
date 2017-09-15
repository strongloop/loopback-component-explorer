// Copyright IBM Corp. 2014,2017. All Rights Reserved.
// Node module: loopback-component-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

/*global SwaggerUIBundle, window, $ */
document.addEventListener('DOMContentLoaded', function() {
  // Pre load translate...
  if (window.SwaggerTranslator) {
    window.SwaggerTranslator.translate();
  }

  getJSON('config.json', function(err, config) {
    if (err) log(err);
    else log(config);
    loadSwaggerUi(config);
  });

  var accessToken;
  function loadSwaggerUi(config) {
    var methodOrder = ['get', 'head', 'options', 'put', 'patch', 'post', 'delete'];
    /* eslint-disable camelcase */
    var defaults = {
      validatorUrl: null,
      url: config.url || '/swagger/resources',
      dom_id: '#swagger-ui',
      supportHeaderParams: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIStandalonePreset,
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl,
      ],
      layout: 'StandaloneLayout',
      onComplete: function(swaggerAPI, swaggerUI) {
        log('Loaded SwaggerUI');
        log(swaggerAPI);
        log(swaggerUI);

        if (window.SwaggerTranslator) {
          window.SwaggerTranslator.translate();
        }
      },
      onFailure: function(data) {
        log('Unable to Load SwaggerUI');
        log(data);
      },
      docExpansion: 'none',
      highlightSizeThreshold: 16384, // not yet supported, https://github.com/swagger-api/swagger-ui/issues/3105
      operationsSorter: function(a, b) {
        var pathCompare = a.get('path').localeCompare(b.get('path'));
        return pathCompare !== 0 ?
          pathCompare :
          methodOrder.indexOf(a.get('method')) - methodOrder.indexOf(b.get('method'));
      },
    };
    var options = Object.assign({}, defaults, window.swaggerUIOptions || {});
    window.swaggerUI = new SwaggerUIBundle(options);
  }

  //
  // Utils
  //

  function log() {
    if ('console' in window) {
      console.log.apply(console, arguments);
    }
  }

  function getJSON(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = function(e) {
      try {
        if (this.status !== 200) throw new Error('Invalid Status: ' + this.status);
        cb(null, JSON.parse(this.responseText));
      } catch (e) {
        cb(e);
      }
    };
    xhr.send();
  }

  if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, 'assign', {
      value: function assign(target, varArgs) { // .length of function is 2
        'use strict';
        if (target == null) { // TypeError if undefined or null
          throw new TypeError('Cannot convert undefined or null to object');
        }

        var to = Object(target);

        for (var index = 1; index < arguments.length; index++) {
          var nextSource = arguments[index];

          if (nextSource != null) { // Skip over if undefined or null
            for (var nextKey in nextSource) {
              // Avoid bugs when hasOwnProperty is shadowed
              if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
        }
        return to;
      },
      writable: true,
      configurable: true,
    });
  }
});
