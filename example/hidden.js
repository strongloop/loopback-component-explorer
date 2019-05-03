// Copyright IBM Corp. 2014,2019. All Rights Reserved.
// Node module: loopback-component-explorer
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const g = require('strong-globalize')();

const loopback = require('loopback');
const app = loopback();
const explorer = require('../');
const port = 3000;

const User = loopback.Model.extend('user', {
  username: 'string',
  email: 'string',
  sensitiveInternalProperty: 'string',
}, {hidden: ['sensitiveInternalProperty']});

User.attachTo(loopback.memory());
app.model(User);

const apiPath = '/api';
explorer(app, {basePath: apiPath});
app.use(apiPath, loopback.rest());
g.log('{{Explorer}} mounted at {{localhost:%s/explorer}}', port);

app.listen(port);
