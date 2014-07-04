# loopback-explorer

Browse and test your LoopBack app's APIs.

## Basic Usage

Below is a simple LoopBack application. The explorer is mounted at `/explorer`.

```js
var loopback = require('loopback');
var app = loopback();
var explorer = require('../');
var port = 3000;

var Product = loopback.Model.extend('product');
Product.attachTo(loopback.memory());
app.model(Product);

app.use('/explorer', explorer(app, {} /* options */));
app.use(loopback.rest());
console.log("Explorer mounted at localhost:" + port + "/explorer");

app.listen(port);
```

## Options

Options are passed to `explorer(app, options)`.

`basePath`: **String**

> Set the base path for swagger resources. 
> Default: `app.get('restAPIRoot')` or  `/swagger/resources`.

`swaggerDistRoot`: **String** 

> Set a path within your application for overriding Swagger UI files.

> If present, will search `swaggerDistRoot` first when attempting to load Swagger UI, allowing
you to pick and choose overrides.

> See [index.html](public/index.html), where you may want to begin your overrides.
> The rest of the UI is provided by [Swagger UI](https://github.com/wordnik/swagger-ui).
