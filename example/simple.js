// Copyright IBM Corp. 2013,2016. All Rights Reserved.
// Node module: loopback-component-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var g = require('strong-globalize')();

var loopback = require('loopback');
var app = loopback();
var explorer = require('../');
var port = 3000;

var Product = loopback.PersistedModel.extend('product', {
  foo: { type: 'string', required: true },
  bar: 'string',
  aNum: { type: 'number', min: 1, max: 10, required: true, default: 5 },
});
Product.attachTo(loopback.memory());

// Some Swagger options - these can be specified in Model JSON:
Product.definition.settings.swagger = {
  tag: {
    name: 'Product Tag Name',
    externalDocs: {
      description: 'More Docs',
      url: 'http://my-external-spec.example.com',
    },
  },
};
Product.definition.settings.description = 'Products for People';

// A custom remoteMethod
Product.foo = function() { return Promise.resolve(); };
/*eslint-disable*/
Product.remoteMethod(
  'foo',
  {
    description: 'A Foo Product Transmogrifier.',
    notes: 'Ethical poutine raw denim, everyday carry twee truffaut kale chips schlitz. ' +
      'Actually microdosing jean shorts',
    accepts: [
      {arg: 'name', type: 'string', required: true, description: 'Product name.'},
      {arg: 'description', type: 'string', required: true, description: 'Product description.'},
      {arg: 'tag', type: 'string', required: false, description: 'Product tag.'},
      {arg: 'count', type: 'number', description: 'How many products to transmogrify.'},
      {arg: 'locale', type: 'string', description: 'Your locale.', default: 'en-US'},
    ],
    returns: {
      arg: 'product', type: 'product', root: true, description: 'Foo Product.'
    },
    http: {verb: 'post', path: '/foo'},
  }
);
/*eslint-enable*/

app.model(Product);

var apiPath = '/api';
explorer(app, { basePath: apiPath });
app.use(apiPath, loopback.rest());
g.log('{{Explorer}} mounted at {{http://localhost:%s/explorer}}', port);

app.listen(port);
