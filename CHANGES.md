2017-03-24, Version 4.2.0
=========================

 * Change Explorer header to use LoopBack (emckean)


2017-02-17, Version 4.1.1
=========================

 * Set z-index to 1 on header to fix styling bug (Imam Assidiqqi)

 * replace slc with lb (ivy ho)


2017-01-31, Version 4.1.0
=========================

 * bump loopback-swagger version to 3.0.1 (Jurien Hamaker)


2016-12-21, Version 4.0.0
=========================

 * Updates for LB3 release (Simon Ho)

 * Update paid support URL (Siddhi Pai)

 * Added another example for explorer Advanced Usage (Pratheek Hegde)

 * Start 3.x + drop support for Node v0.10/v0.12 (siddhipai)

 * Drop support for Node v0.10 and v0.12 (Siddhi Pai)

 * Start the development of the next major version (Siddhi Pai)

 * CSS line terminations (Wisu Suntoyo)

 * Fix jsoneditor not defined error (David Cheung)


2016-10-14, Version 3.0.0
=========================

 * Update to mainline swagger-ui (Samuel Reed)

 * Start 3.0 development (Miroslav Bajtoš)


2016-10-12, Version 2.7.0
=========================

 * Update translation files - round#2 (Candy)

 * Add translated files (gunjpan)

 * Use new api for disabling a remote method. (Richard Pringle)

 * Fix tests to not depend on exact EOL chars (Miroslav Bajtoš)

 * Update deps to loopback 3.0.0 RC (Miroslav Bajtoš)

 * Deprecate built-in CORS middleware (Miroslav Bajtoš)

 * Use loopback@3.0.0-alpha for running the tests. (Miroslav Bajtoš)


2016-09-05, Version 2.6.0
=========================

 * Add globalization (Simon Ho)

 * Update URLs in CONTRIBUTING.md (#169) (Ryan Graham)

 * Redirect get http 301 instead of 303 (jannyHou)

 * Add blank lines to separate error-checking and done logic from other logic (Supasate Choochaisri)

 * Ignore copyright in dummy swagger-ui test (Supasate Choochaisri)

 * Upgrade loopback devDependency (Supasate Choochaisri)

 * update copyright notices and license (Ryan Graham)

 * examples launch fix (Alexander Ryzhikov)


2016-05-02, Version 2.5.0
=========================

 * Add feature to hide disabled remote methods after explorer is initialized (Supasate Choochaisri)

 * More fixes of indentation in index.js (Miroslav Bajtoš)

 * Fix broken indentation (Miroslav Bajtoš)

 * Fix linting errors (Amir Jafarian)

 * Auto-update by eslint --fix (Amir Jafarian)

 * Add eslint infrastructure (Amir Jafarian)


2016-03-08, Version 2.4.0
=========================

 * Add `swaggerUI` option to enable/disable UI serving (Raymond Feng)


2016-02-02, Version 2.3.0
=========================



2016-01-13, Version 2.2.0
=========================

 * remove references to ubuntu font (Anthony Ettinger)

 * Update swaggerObject when a new model was added (Pradeep Kumar Tippa)

 * Refer to licenses with a link (Sam Roberts)


2015-10-01, Version 2.1.1
=========================

 * disable Swagger validation badge (Hage Yaapa)

 * Updated "resourcePath: 'swaggerResources'" to "resourcePath: 'swagger.json'" (Dennis Ashby)

 * Use strongloop conventions for licensing (Sam Roberts)


2015-09-17, Version 2.1.0
=========================

 * Rename the module to loopback-component-explorer (Rand McKinney)


2015-09-08, Version 2.0.1
=========================

 * Sort APIs and operations. (Samuel Reed)


2015-09-04, Version 2.0.0
=========================

 * Use loopback-swagger to generate swagger.json (Miroslav Bajtoš)

 * Bump up strong-swagger-ui version to ^21.0.0 (Miroslav Bajtoš)

 * Register loopback-explorer to app (Hage Yaapa)

 * Generate Swagger Spec 2.0 documentation (Miroslav Bajtoš)

 * Upgrade to strong-swagger-ui@21.0 (swagger-ui@2.1) (Miroslav Bajtoš)

 * bump major version (Ryan Graham)

 * Rework the module to a loopback component (Miroslav Bajtoš)

 * Add `opts.host` to customize host of resource URLs (cndreiter)

 * Removed branch-lock, and bumped version (Shelby Sanders)

 * Corrected to propagate properties from existing items object (Shelby Sanders)

 * Use strong-swagger-ui instead of swagger-ui (Miroslav Bajtoš)

 * Remove public/images/throbber.gif (Miroslav Bajtoš)

 * Move CSS customizations to loopbackStyles.css (Miroslav Bajtoš)

 * Added Swagger fields for items and max/min(Items|Length) (Shelby Sanders)

 * Corrected accidental duplication of responseMessages from merge (Shelby Sanders)

 * review comments (Ying Tang)

 * add more tests (Ying Tang)

 * float additionalProperties and description to top (Ying Tang)

 * Convert array to string for summary, note, and description. Fix additionalProperties (Ying Tang)

 * back out changes of id to URI (Ying Tang)

 * Uri id and $ref, join description (Ying Tang)

 * propertyName, not property (Ying Tang)

 * fix resource listing and remove id from each property (Ying Tang)

 * remove id fields from required array (Ying Tang)

 * remove required from sub-schema (Ying Tang)

 * bump version (Ying Tang)

 * add $ref and remove type for models (Ying Tang)

 * Changed Swagger() to omit resources with no content (Shelby Sanders)

 * Added event emission for swaggerResources to support customization (Shelby Sanders)

 * Corrected handling of type for operation, including containers (Shelby Sanders)

 * Corrected handling for absent settings.additionalProperties (Shelby Sanders)

 * Added support for public in order to hide operations from Swagger (Shelby Sanders)

 * added reference to settings for additional properties (Jake Ayala)

 * Protected against non-Model generation requests (Shelby Sanders)

 * Corrected merge issues (Shelby Sanders)

 * Added padding to content well in order to counteract changes in SwaggerUI (Shelby Sanders)

 * Added support for scanning accepts params for Model references (Shelby Sanders)

 * Changed addRoute() to honor X-Forwarded-Host (Shelby Sanders)

 * Removed branch-lock for loopback (Shelby Sanders)

 * Changed to possibly pull model description from ctor.settings (Shelby Sanders)

 * Corrected generateModelDefinition() to scan for model references nested in other models (Shelby Sanders)

 * Corrected prepareDataType() to handle collections and nesting, and changed to always and only use responseMessages (Shelby Sanders)

 * Corrected generateModelDefinition() to scan for model references in remote returns and errors (Shelby Sanders)

 * Corrected default for consumes+produces (Shelby Sanders)

 * Ported prepareDataType() from old strong-remoting:ext/swagger.js (Shelby Sanders)

 * Corrected issues with merge of 2.x changes (Shelby Sanders)

 * Load swagger ui from `swagger-ui` package instead. (Samuel Reed)

 * Ported extensions for more Swagger 1.2 metadata, returns+errors as responseMessages, consumes+produces, and X-Forwarded-Proto for reverse-proxying from HTTPS to HTTP (Shelby Sanders)

 * Upgraded to SwaggerUI 2.0.18 (Shelby Sanders)

 * Added support for toggling Model and Schema, and added support for primitives in StatusCodeView (Shelby Sanders)

 * Ensure Response Content Type is shown regardless of Response Class (Shelby Sanders)

 * Reverted to use special loading logic from loopback-explorer (Shelby Sanders)

 * Updated to latest Swagger-UI for better responseMessage signature handling (Shelby Sanders)

 * Upgraded to latest Swagger-UI for 1.2 support (Shelby Sanders)

 * Correct description of collections of object and nested (Shelby Sanders)

 * Add indication of response being a collection (Shelby Sanders)


2015-06-25, Version 1.8.0
=========================

 * Add opts.omitProtocolInBaseUrl (Miroslav Bajtoš)

 * Fix tests broken by fa3035c (#96) (Miroslav Bajtoš)

 * Fix model description getting lost (bkniffler)


2015-03-30, Version 1.7.2
=========================

 * Allow submitting token input with empty value to remove token. (Samuel Reed)

 * Fix duplicate stylesheet issue (Pradnya Baviskar)

 * Fix explorer tests for different line endings on Windows (Pradnya Baviskar)


2015-02-23, Version 1.7.1
=========================

 * Remove unused external font "Droid Sans". (Miroslav Bajtoš)


2015-02-17, Version 1.7.0
=========================

 * Made API doc of class use the http.path of the class if available, or the name of the class as a fallback (gandrianakis)


2015-01-09, Version 1.6.4
=========================

 * Prevent double slash in the resource URLs (Miroslav Bajtoš)

 * Allow `uiDirs` to be defined as a String (Simon Ho)

 * Save accessToken in localStorage. Fixes #47 (Samuel Reed)


2015-01-06, Version 1.6.3
=========================

 * Fix bad CLA URL in CONTRIBUTING.md (Ryan Graham)

 * Add X-UA-Compatible tag (Nick Van Dyck)


2014-12-12, Version 1.6.2
=========================

 * Move 200 response to `type` on the operation object. See #75. (Samuel Reed)


2014-12-08, Version 1.6.1
=========================

 * Use full lodash instead of lodash components (Ryan Graham)


2014-12-02, Version 1.6.0
=========================

 * Remove model name from nickname, swagger spec understands op context. (Samuel Reed)


2014-11-29, Version 1.5.2
=========================

 * model-helper: ignore unknown property types (Miroslav Bajtoš)


2014-10-24, Version 1.5.1
=========================



2014-10-24, Version 1.5.0
=========================

 * Add an option `uiDirs` (Miroslav Bajtoš)

 * swagger: honour X-Forwarded-Proto header (Miroslav Bajtoš)


2014-10-21, Version 1.4.0
=========================

 * Bump version (Raymond Feng)

 * Add integration tests for included models (Miroslav Bajtoš)

 * route-helper: add `responseMessages` (Miroslav Bajtoš)

 * model-helper: support anonymous object types (Miroslav Bajtoš)

 * swagger: include models from accepts/returns args (Miroslav Bajtoš)

 * loopbackStyles: improve spacing in small window (Miroslav Bajtoš)

 * swagger: Deprecate `opts.swaggerVersion` (Miroslav Bajtoš)

 * swagger: use X-Forwarded-Host for basePath (Miroslav Bajtoš)

 * example: use PersistedModel instead of Model (Miroslav Bajtoš)

 * models: include model's `description` (Miroslav Bajtoš)

 * Refactor conversion of data types (Miroslav Bajtoš)

 * Move `convertText` to `typeConverter` (Miroslav Bajtoš)

 * Add support for `context` and `res` param types (Krishna Raman)

 * package: update devDependencies (Miroslav Bajtoš)

 * gitignore: add .idea, *.tgz, *.iml (Miroslav Bajtoš)

 * Support multi-line array `description` and `notes` (Miroslav Bajtoš)

 * Use `1.0.0` as the default app version. (Miroslav Bajtoš)

 * Extend `consumes` and `produces` metadata (Miroslav Bajtoš)

 * route-helper: include `notes` and `deprecated` (Miroslav Bajtoš)

 * Pull model description from ctor.settings first (Shelby Sanders)


2014-10-08, Version 1.3.0
=========================

 * swagger: allow cross-origin requests (Miroslav Bajtoš)

 * Sort endpoints by letter. (Samuel Reed)

 * Add syntax highlighting styles & highlight threshold. (Samuel Reed)

 * Add contribution guidelines (Ryan Graham)


2014-09-22, Version 1.2.11
==========================

 * Bump version (Raymond Feng)

 * Fix how the array of models is iterated (Raymond Feng)


2014-09-05, Version 1.2.10
==========================

 * Bump version (Raymond Feng)

 * Make sure nested/referenced models in array are mapped to swagger (Clark Wang)

 * Make sure nested/referenced models are mapped to swagger (Raymond Feng)


2014-08-15, Version 1.2.9
=========================

 * Bump version (Raymond Feng)

 * Newest Swagger UI requires application/x-www-form-urlencoded. (Samuel Reed)

 * Use `dist` property from swagger-ui package. (Samuel Reed)

 * Fixed undefined modelClass when using polymorphic relations (Navid Nikpour)


2014-08-08, Version 1.2.8
=========================

 * Bump version (Raymond Feng)

 * Fix the type name for a property if model class is used (Raymond Feng)


2014-08-04, Version 1.2.7
=========================

 * Bump version (Raymond Feng)

 * Set up default consumes/produces media types (Raymond Feng)

 * Fix the default opts (Raymond Feng)

 * Add required swagger 1.2 items property for property type array (Ritchie Martori)

 * Allow passing a custom protocol. (Samuel Reed)


2014-07-29, Version 1.2.6
=========================

 * Bump version (Raymond Feng)

 * res.send deprecated - updated to res.status (Geoffroy)

 * Remove hidden properties from definition. (Samuel Reed)


2014-07-25, Version 1.2.5
=========================

 * Bump version (Raymond Feng)

 * Ensure models from relations are included (Raymond Feng)


2014-07-22, Version 1.2.4
=========================

 * model-helper: handle arrays with undefined items (Miroslav Bajtoš)


2014-07-22, Version 1.2.3
=========================

 * model-helper: handle array types with no item type (Miroslav Bajtoš)


2014-07-20, Version 1.2.2
=========================

 * Bump version (Raymond Feng)

 * Properly convert complex return types. (Samuel Reed)


2014-07-18, Version 1.2.1
=========================

 * Bump version (Raymond Feng)

 * Fix up loopback.rest() model definition hack. (Samuel Reed)


2014-07-14, Version 1.2.0
=========================

 * Bump version and update deps (Raymond Feng)

 * s/accessToken/access_token in authorization key name (Samuel Reed)

 * Fix resources if the explorer is at a deep path. (Samuel Reed)

 * Fix debug namespace, express version. (Samuel Reed)

 * Remove forgotten TODO. (Samuel Reed)

 * Simplify `accepts` and `returns` hacks. (Samuel Reed)

 * More consise type tests (Samuel Reed)

 * Remove preMiddleware. (Samuel Reed)

 * Remove swagger.test.js license (Samuel Reed)

 * Remove peerDependencies, use express directly. (Samuel Reed)

 * Add url-join so path.join() doesn't break windows (Samuel Reed)

 * Rename translateKeys to translateDataTypeKeys. (Samuel Reed)

 * Refactor route-helper & add tests. (Samuel Reed)

 * LDL to Swagger fixes & extensions. (Samuel Reed)

 * Use express routes instead of modifying remoting. (Samuel Reed)

 * Fix missing strong-remoting devDependency. (Samuel Reed)

 * Restore existing styles. (Samuel Reed)

 * Allow easy setting of accessToken in explorer UI. (Samuel Reed)

 * Refactor key translations between LDL & Swagger. (Samuel Reed)

 * Refactoring swagger 1.2 rework. (Samuel Reed)

 * Make sure body parameter is shown. (Raymond Feng)

 * Some swagger 1.2 migration cleanup. (Samuel Reed)

 * Fix api resource path and type ref to models. (Raymond Feng)

 * Swagger 1.2 compatability. Moved strong-remoting/ext/swagger to this module. (Samuel Reed)

 * Load swagger ui from `swagger-ui` package instead. (Samuel Reed)


2014-05-28, Version 1.1.1
=========================

 * package.json: add support for loopback 2.x (Miroslav Bajtoš)

 * Make sure X-Powered-By header is disabled (Alex Pica)

 * Fix license url (Raymond Feng)

 * Update to dual MIT/StrongLoop license (Raymond Feng)


2014-01-14, Version 1.1.0
=========================

 * Bump up loopback min version to 1.5 (Miroslav Bajtoš)

 * Use `app.get('restApiRoot')` as default basePath (Miroslav Bajtoš)

 * Replace strong-remoting ext/swagger with app.docs (Miroslav Bajtoš)


2014-01-13, Version 1.0.2
=========================

 * Bump version (Raymond Feng)

 * README: mount REST at /api in the sample code (Miroslav Bajtos)

 * Reorder middleware to fix unit-test failures. (Miroslav Bajtos)

 * Fix loading of loopback dependencies. (Miroslav Bajtos)


2013-12-04, Version 1.0.1
=========================

 * First release!
