var loopback = require('loopback');
var app = loopback();
var explorer = require('../');
var port = 3000;

var Product = loopback.Model.extend('product');
Product.attachTo(loopback.memory());
app.model(Product);

app.use('/explorer', explorer(app));
app.use(loopback.rest());
console.log("Explorer mounted at localhost:" + port + "/explorer");

app.listen(port);
