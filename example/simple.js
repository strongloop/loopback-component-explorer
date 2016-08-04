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
app.model(Product);

var apiPath = '/api';
explorer(app, { basePath: apiPath });
app.use(apiPath, loopback.rest());
g.log('{{Explorer}} mounted at {{http://localhost:%s/explorer}}', port);

app.listen(port);
