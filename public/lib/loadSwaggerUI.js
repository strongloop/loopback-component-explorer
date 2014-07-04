'use strict';

// Refactoring of inline script from index.html.
/*global SwaggerUi, log, ApiKeyAuthorization, hljs */
$(function() {
    $.getJSON('config.json', function(config) {
        log(config);
        loadSwaggerUi(config);
    });
});

function loadSwaggerUi(config) {
    window.swaggerUi = new SwaggerUi({
      url: config.url || "/swagger/resources",
      apiKey: "",
      dom_id: "swagger-ui-container",
      supportHeaderParams: true,
      supportedSubmitMethods: ['get', 'post', 'put', 'delete'],
      onComplete: function(swaggerApi, swaggerUi) {
        log("Loaded SwaggerUI");
        log(swaggerApi);
        log(swaggerUi);
        $('pre code').each(function(i, e) {hljs.highlightBlock(e); });
      },
      onFailure: function(data) {
        log("Unable to Load SwaggerUI");
        log(data);
      },
      docExpansion: "none"
    });

    $('#input_accessToken').change(function() {
      var key = $('#input_accessToken')[0].value;
      log("key: " + key);
      if(key && key.trim() !== "") {
        log("added accessToken " + key);
        window.authorizations.add("key", new ApiKeyAuthorization("accessToken", key, "query"));
      }
    });

    window.swaggerUi.load();
}
