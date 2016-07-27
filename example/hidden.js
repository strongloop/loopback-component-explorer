// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-component-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var g = require('strong-globalize')();

var loopback = require('loopback');
var app = loopback();
var explorer = require('../');
var port = 3000;

var User = loopback.Model.extend('user', {
  username: 'string',
  email: 'string',
  sensitiveInternalProperty: 'string',
}, { hidden: ['sensitiveInternalProperty'] });

User.attachTo(loopback.memory());
app.model(User);

var apiPath = '/api';
explorer(app, { basePath: apiPath });
app.use(apiPath, loopback.rest());
g.log('{{Explorer}} mounted at {{localhost:%s/explorer}}', port);

app.listen(port);
