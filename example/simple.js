var loopback = require('loopback');
var app = loopback();
var explorer = require('../');
var port = 3000;

var Product = loopback.PersistedModel.extend('product', {
  foo: {type: 'string', required: true},
  bar: 'string',
  aNum: {type: 'number', min: 1, max: 10, required: true, default: 5}
});
Product.attachTo(loopback.memory());
app.model(Product);

var apiPath = '/api';
app.use('/explorer', explorer(app, {basePath: apiPath}));
app.use(apiPath, loopback.rest());
console.log('Explorer mounted at http://localhost:' + port + '/explorer');

var Catalog = loopback.PersistedModel.extend('catalog', {
  name: {type: 'string', required: true}
});
Catalog.attachTo(loopback.memory());
app.model(Catalog);

app.listen(port);
