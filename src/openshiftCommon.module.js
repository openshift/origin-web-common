/**
 * @name  openshiftCommon
 *
 * @description
 *   Base module for openshiftCommon.
 */
angular.module('openshiftCommon', ['kubernetesUI', 'ab-base64'])
  .config(function(AuthServiceProvider) {
    AuthServiceProvider.UserStore('MemoryUserStore');
  })
  .constant("API_CFG", _.get(window.OPENSHIFT_CONFIG, "api", {}))
  .constant("APIS_CFG", _.get(window.OPENSHIFT_CONFIG, "apis", {}))
  .constant("AUTH_CFG", _.get(window.OPENSHIFT_CONFIG, "auth", {}))
  .constant("LOGGING_URL", _.get(window.OPENSHIFT_CONFIG, "loggingURL"))
  .constant("METRICS_URL", _.get(window.OPENSHIFT_CONFIG, "metricsURL"))
  .constant("LIMIT_REQUEST_OVERRIDES", _.get(window.OPENSHIFT_CONFIG, "limitRequestOverrides"))
  .config(function($httpProvider, AuthServiceProvider, RedirectLoginServiceProvider, AUTH_CFG, API_CFG, kubernetesContainerSocketProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');

    AuthServiceProvider.LoginService('RedirectLoginService');
    AuthServiceProvider.LogoutService('DeleteTokenLogoutService');
    // TODO: fall back to cookie store when localStorage is unavailable (see known issues at http://caniuse.com/#feat=namevalue-storage)
    AuthServiceProvider.UserStore('LocalStorageUserStore');

    RedirectLoginServiceProvider.OAuthClientID(AUTH_CFG.oauth_client_id);
    RedirectLoginServiceProvider.OAuthAuthorizeURI(AUTH_CFG.oauth_authorize_uri);
    RedirectLoginServiceProvider.OAuthRedirectURI(URI(AUTH_CFG.oauth_redirect_base).segment("oauth").toString());

    // Configure the container terminal
    kubernetesContainerSocketProvider.WebSocketFactory = "ContainerWebSocket";
  });

hawtioPluginLoader.addModule('openshiftCommon');

// API Discovery, this runs before the angular app is bootstrapped
// TODO we want this to be possible with a single request against the API instead of being dependent on the numbers of groups and versions
hawtioPluginLoader.registerPreBootstrapTask(function(next) {
  // Skips api discovery, needed to run spec tests
  if ( _.get(window, "OPENSHIFT_CONFIG.api.k8s.resources") ) {
    next();
    return;
  }

  var api = {
    k8s: {},
    openshift: {}
  };
  var apis = {};
  var API_DISCOVERY_ERRORS = [];
  var protocol = window.location.protocol + "//";

  // Fetch /api/v1 for legacy k8s resources, we will never bump the version of these legacy apis so fetch version immediately
  var k8sBaseURL = protocol + window.OPENSHIFT_CONFIG.api.k8s.hostPort + window.OPENSHIFT_CONFIG.api.k8s.prefix;
  var k8sDeferred = $.get(k8sBaseURL + "/v1")
    .done(function(data) {
      api.k8s.v1 = _.indexBy(data.resources, 'name');
    })
    .fail(function(data, textStatus, jqXHR) {
      API_DISCOVERY_ERRORS.push({
        data: data,
        textStatus: textStatus,
        xhr: jqXHR
      });
    });

  // Fetch /oapi/v1 for legacy openshift resources, we will never bump the version of these legacy apis so fetch version immediately
  var osBaseURL = protocol + window.OPENSHIFT_CONFIG.api.openshift.hostPort + window.OPENSHIFT_CONFIG.api.openshift.prefix;
  var osDeferred = $.get(osBaseURL + "/v1")
    .done(function(data) {
      api.openshift.v1 = _.indexBy(data.resources, 'name');
    })
    .fail(function(data, textStatus, jqXHR) {
      API_DISCOVERY_ERRORS.push({
        data: data,
        textStatus: textStatus,
        xhr: jqXHR
      });
    });

  // Fetch /apis to get the list of groups and versions, then fetch each group/
  // Because the api discovery doc returns arrays and we want maps, this creates a structure like:
  // {
  //   extensions: {
  //     name: "extensions",
  //     preferredVersion: "v1beta1",
  //     versions: {
  //       v1beta1: {
  //         version: "v1beta1",
  //         groupVersion: "extensions/v1beta1"
  //         resources: {
  //           daemonsets: {
  //             /* resource returned from discovery API */
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
  var apisBaseURL = protocol + window.OPENSHIFT_CONFIG.apis.hostPort + window.OPENSHIFT_CONFIG.apis.prefix;
  var apisDeferred = $.get(apisBaseURL)
    .then(function(data) {
      var apisDeferredVersions = [];
      _.each(data.groups, function(apiGroup) {
        var group = {
          name: apiGroup.name,
          preferredVersion: apiGroup.preferredVersion.version,
          versions: {}
        };
        apis[group.name] = group;
        _.each(apiGroup.versions, function(apiVersion) {
          var versionStr = apiVersion.version;
          group.versions[versionStr] = {
            version: versionStr,
            groupVersion: apiVersion.groupVersion
          };
          apisDeferredVersions.push($.get(apisBaseURL + "/" + apiVersion.groupVersion)
            .done(function(data) {
              group.versions[versionStr].resources = _.indexBy(data.resources, 'name');
            })
            .fail(function(data, textStatus, jqXHR) {
              API_DISCOVERY_ERRORS.push({
                data: data,
                textStatus: textStatus,
                xhr: jqXHR
              });
            }));
        });
      });
      return $.when.apply(this, apisDeferredVersions);
    }, function(data, textStatus, jqXHR) {
      API_DISCOVERY_ERRORS.push({
        data: data,
        textStatus: textStatus,
        xhr: jqXHR
      });
    });

  // Will be called on success or failure
  var discoveryFinished = function() {
    window.OPENSHIFT_CONFIG.api.k8s.resources = api.k8s;
    window.OPENSHIFT_CONFIG.api.openshift.resources = api.openshift;
    window.OPENSHIFT_CONFIG.apis.groups = apis;
    if (API_DISCOVERY_ERRORS.length) {
      window.OPENSHIFT_CONFIG.apis.API_DISCOVERY_ERRORS = API_DISCOVERY_ERRORS;
    }
    next();
  };
  $.when(k8sDeferred,osDeferred,apisDeferred).always(discoveryFinished);
});


