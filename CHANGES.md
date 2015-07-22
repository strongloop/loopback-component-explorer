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
