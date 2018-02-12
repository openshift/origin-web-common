/**
 * @name  openshiftCommonServices
 *
 * @description
 *   Base module for openshiftCommonServices.
 */
angular.module('openshiftCommonServices', ['ab-base64'])
  .config(function(AuthServiceProvider) {
    AuthServiceProvider.UserStore('MemoryUserStore');
  })
  .constant("API_CFG", _.get(window.OPENSHIFT_CONFIG, "api", {}))
  .constant("APIS_CFG", _.get(window.OPENSHIFT_CONFIG, "apis", {}))
  .constant("AUTH_CFG", _.get(window.OPENSHIFT_CONFIG, "auth", {}))
  .config(function($httpProvider, AuthServiceProvider, RedirectLoginServiceProvider, AUTH_CFG) {
    $httpProvider.interceptors.push('AuthInterceptor');

    AuthServiceProvider.LoginService('RedirectLoginService');
    AuthServiceProvider.LogoutService('DeleteTokenLogoutService');
    // TODO: fall back to cookie store when localStorage is unavailable (see known issues at http://caniuse.com/#feat=namevalue-storage)
    AuthServiceProvider.UserStore('LocalStorageUserStore');

    RedirectLoginServiceProvider.OAuthClientID(AUTH_CFG.oauth_client_id);
    RedirectLoginServiceProvider.OAuthAuthorizeURI(AUTH_CFG.oauth_authorize_uri);
    RedirectLoginServiceProvider.OAuthTokenURI(AUTH_CFG.oauth_token_uri);
    RedirectLoginServiceProvider.OAuthRedirectURI(URI(AUTH_CFG.oauth_redirect_base).segment("oauth").toString());
  });

hawtioPluginLoader.addModule('openshiftCommonServices');

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
      api.k8s.v1 =  _.keyBy(data.resources, 'name');
    })
    .fail(function(data, textStatus, jqXHR) {
      API_DISCOVERY_ERRORS.push({
        data: data,
        textStatus: textStatus,
        xhr: jqXHR,
        fatal: true
      });
    });

  // Fetch /oapi/v1 for legacy openshift resources, we will never bump the version of these legacy apis so fetch version immediately
  var osBaseURL = protocol + window.OPENSHIFT_CONFIG.api.openshift.hostPort + window.OPENSHIFT_CONFIG.api.openshift.prefix;
  var osDeferred = $.get(osBaseURL + "/v1")
    .done(function(data) {
      api.openshift.v1 =  _.keyBy(data.resources, 'name');
    })
    .fail(function(data, textStatus, jqXHR) {
      API_DISCOVERY_ERRORS.push({
        data: data,
        textStatus: textStatus,
        xhr: jqXHR,
        fatal: true
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
  var getGroups = function(baseURL, hostPrefix, data) {
    var apisDeferredVersions = [];
    _.each(data.groups, function(apiGroup) {
      var group = {
        name: apiGroup.name,
        preferredVersion: apiGroup.preferredVersion.version,
        versions: {},
        hostPrefix: hostPrefix
      };
      apis[group.name] = group;
      _.each(apiGroup.versions, function(apiVersion) {
        var versionStr = apiVersion.version;
        group.versions[versionStr] = {
          version: versionStr,
          groupVersion: apiVersion.groupVersion
        };
        apisDeferredVersions.push($.get(baseURL + "/" + apiVersion.groupVersion)
          .done(function(data) {
            group.versions[versionStr].resources =  _.keyBy(data.resources, 'name');
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
  };
  var apisDeferred = $.get(apisBaseURL)
    .then(_.partial(getGroups, apisBaseURL, null), function(data, textStatus, jqXHR) {
      API_DISCOVERY_ERRORS.push({
        data: data,
        textStatus: textStatus,
        xhr: jqXHR,
        fatal: true
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
  var allDeferreds = [
    k8sDeferred,
    osDeferred,
    apisDeferred
  ];
  $.when.apply(this, allDeferreds).always(discoveryFinished);
});


;'use strict';

angular.module("openshiftCommonServices")
  .service("AlertMessageService", function(){
    var alertHiddenKey = function(alertID, namespace) {
      if (!namespace) {
        return 'hide/alert/' + alertID;
      }

      return 'hide/alert/' + namespace + '/' + alertID;
    };
    return {
      isAlertPermanentlyHidden: function(alertID, namespace) {
        var key = alertHiddenKey(alertID, namespace);
        return localStorage.getItem(key) === 'true';
      },
      permanentlyHideAlert: function(alertID, namespace) {
        var key = alertHiddenKey(alertID,namespace);
        localStorage.setItem(key, 'true');
      }
    };
  });
;'use strict';

// ResourceGroupVersion represents a fully qualified resource
function ResourceGroupVersion(resource, group, version) {
  this.resource = resource;
  this.group    = group;
  this.version  = version;
  return this;
}
// toString() includes the group and version information if present
ResourceGroupVersion.prototype.toString = function() {
  var s = this.resource;
  if (this.group)   { s += "/" + this.group;   }
  if (this.version) { s += "/" + this.version; }
  return s;
};
// primaryResource() returns the resource with any subresources removed
ResourceGroupVersion.prototype.primaryResource = function() {
  if (!this.resource) { return ""; }
  var i = this.resource.indexOf('/');
  if (i === -1) { return this.resource; }
  return this.resource.substring(0,i);
};
// subresources() returns a (possibly empty) list of subresource segments
ResourceGroupVersion.prototype.subresources = function() {
  var segments = (this.resource || '').split("/");
  segments.shift();
  return segments;
};
// equals() returns true if the given resource, group, and version match.
// If omitted, group and version are not compared.
ResourceGroupVersion.prototype.equals = function(resource, group, version) {
  if (this.resource !== resource) { return false; }
  if (arguments.length === 1)     { return true;  }
  if (this.group !== group)       { return false; }
  if (arguments.length === 2)     { return true;  }
  if (this.version !== version)   { return false; }
  return true;
};

angular.module('openshiftCommonServices')
.factory('APIService', function(API_CFG,
                                APIS_CFG,
                                API_PREFERRED_VERSIONS,
                                API_DEDUPLICATION,
                                AuthService,
                                Constants,
                                Logger,
                                $q,
                                $http,
                                $filter,
                                $window) {
  // Set the default api versions the console will use if otherwise unspecified
  var defaultVersion = {
    "":           "v1",
    "extensions": "v1beta1"
  };

  // toResourceGroupVersion() returns a ResourceGroupVersion.
  // If resource is already a ResourceGroupVersion, returns itself.
  //
  // if r is a string, the empty group and default version for the empty group are assumed.
  //
  // if r is an object, the resource, group, and version attributes are read.
  // a missing group attribute defaults to the legacy group.
  // a missing version attribute defaults to the default version for the group, or undefined if the group is unknown.
  //
  // if r is already a ResourceGroupVersion, it is returned as-is
  var toResourceGroupVersion = function(r) {
    if (r instanceof ResourceGroupVersion) {
      return r;
    }
    var resource, group, version;
    if (angular.isString(r)) {
      resource = normalizeResource(r);
      group = '';
      version = defaultVersion[group];
    } else if (r && r.resource) {
      resource = normalizeResource(r.resource);
      group = r.group || '';
      version = r.version || defaultVersion[group] || _.get(APIS_CFG, ["groups", group, "preferredVersion"]);
    }
    return new ResourceGroupVersion(resource, group, version);
  };


  var toAPIVersion = function(resourceGroupVersion) {
    if (resourceGroupVersion.group) {
      return resourceGroupVersion.group + '/' + resourceGroupVersion.version;
    }
    return resourceGroupVersion.version;
  };

  // normalizeResource lowercases the first segment of the given resource. subresources can be case-sensitive.
  function normalizeResource(resource) {
    if (!resource) {
      return resource;
    }
    var i = resource.indexOf('/');
    if (i === -1) {
      return resource.toLowerCase();
    }
    return resource.substring(0, i).toLowerCase() + resource.substring(i);
  }

  // port of group_version.go#ParseGroupVersion
  var parseGroupVersion = function(apiVersion) {
    if (!apiVersion) {
      return undefined;
    }
    var parts = apiVersion.split("/");
    if (parts.length === 1) {
      if (parts[0] === "v1") {
        return {group: '', version: parts[0]};
      }
      return {group: parts[0], version: ''};
    }
    if (parts.length === 2) {
      return {group:parts[0], version: parts[1]};
    }
    Logger.warn('Invalid apiVersion "' + apiVersion + '"');
    return undefined;
  };

  var objectToResourceGroupVersion = function(apiObject) {
    if (!apiObject || !apiObject.kind || !apiObject.apiVersion) {
      return undefined;
    }
    var resource = kindToResource(apiObject.kind);
    if (!resource) {
      return undefined;
    }
    var groupVersion = parseGroupVersion(apiObject.apiVersion);
    if (!groupVersion) {
      return undefined;
    }
    return new ResourceGroupVersion(resource, groupVersion.group, groupVersion.version);
  };

  // deriveTargetResource figures out the fully qualified destination to submit the object to.
  // if resource is a string, and the object's kind matches the resource, the object's group/version are used.
  // if resource is a ResourceGroupVersion, and the object's kind and group match, the object's version is used.
  // otherwise, resource is used as-is.
  var deriveTargetResource = function(resource, object) {
    if (!resource || !object) {
      return undefined;
    }
    var objectResource = kindToResource(object.kind);
    var objectGroupVersion = parseGroupVersion(object.apiVersion);
    var resourceGroupVersion = toResourceGroupVersion(resource);
    if (!objectResource || !objectGroupVersion || !resourceGroupVersion) {
      return undefined;
    }

    // We specified something like "pods"
    if (angular.isString(resource)) {
      // If the object had a matching kind {"kind":"Pod","apiVersion":"v1"}, use the group/version from the object
      if (resourceGroupVersion.equals(objectResource)) {
        resourceGroupVersion.group = objectGroupVersion.group;
        resourceGroupVersion.version = objectGroupVersion.version;
      }
      return resourceGroupVersion;
    }

    // If the resource was already a fully specified object,
    // require the group to match as well before taking the version from the object
    if (resourceGroupVersion.equals(objectResource, objectGroupVersion.group)) {
      resourceGroupVersion.version = objectGroupVersion.version;
    }
    return resourceGroupVersion;
  };

  // port of restmapper.go#kindToResource
  // humanize will add spaces between words in the resource
  function kindToResource(kind, humanize) {
    if (!kind) {
      return "";
    }
    var resource = kind;
    if (humanize) {
      var humanizeKind = $filter("humanizeKind");
      resource = humanizeKind(resource);
    }
    resource = String(resource).toLowerCase();
    if (resource === 'endpoints' || resource === 'securitycontextconstraints') {
      // no-op, plural is the singular
    }
    else if (resource[resource.length-1] === 's') {
      resource = resource + 'es';
    }
    else if (resource[resource.length-1] === 'y') {
      resource = resource.substring(0, resource.length-1) + 'ies';
    }
    else {
      resource = resource + 's';
    }

    return resource;
  }

  function kindToResourceGroupVersion(kind) {
    return toResourceGroupVersion({
      resource: kindToResource(kind.kind),
      group: kind.group
    });
  }

  // apiInfo returns the host/port, prefix, group, and version for the given resource,
  // or undefined if the specified resource/group/version is known not to exist.
  var apiInfo = function(resource) {
    // If API discovery had any failures, calls to api info should redirect to the error page
    if (APIS_CFG.API_DISCOVERY_ERRORS) {
      var possibleCertFailure  = _.every(APIS_CFG.API_DISCOVERY_ERRORS, function(error){
        return _.get(error, "data.status") === 0;
      });
      if (possibleCertFailure && !AuthService.isLoggedIn()) {
        // will trigger a login flow which will redirect to the api server
        AuthService.withUser();
        return;
      }
      var fatal = false;
      _.each(APIS_CFG.API_DISCOVERY_ERRORS, function(discoveryError) {
        if (discoveryError.fatal) {
          Logger.error('API discovery failed (fatal error)', discoveryError);
          fatal = true;
          return;
        }

        Logger.warn('API discovery failed', discoveryError);
      });
      if (fatal) {
        // Go to the error page on fatal errors, the server might be down.
        // Can't use Navigate.toErrorPage or it will create a circular
        // dependency
        $window.location.href = URI('error').query({
          error_description: "Unable to load details about the server. If the problem continues, please contact your system administrator.",
          error: "API_DISCOVERY"
        }).toString();
        return;
      }
    }

    resource = toResourceGroupVersion(resource);
    var primaryResource = resource.primaryResource();
    var discoveredResource;
    // API info for resources in an API group, if the resource was not found during discovery return undefined
    if (resource.group) {
      discoveredResource = _.get(APIS_CFG, ["groups", resource.group, "versions", resource.version, "resources", primaryResource]);
      if (!discoveredResource) {
        return undefined;
      }
      var hostPrefixObj = _.get(APIS_CFG, ["groups", resource.group, 'hostPrefix']) || APIS_CFG;
      return {
        resource: resource.resource,
        group:    resource.group,
        version:  resource.version,
        protocol: hostPrefixObj.protocol,
        hostPort: hostPrefixObj.hostPort,
        prefix:   hostPrefixObj.prefix,
        namespaced: discoveredResource.namespaced,
        verbs: discoveredResource.verbs
      };
    }

    // Resources without an API group could be legacy k8s or origin resources.
    // Scan through resources to determine which this is.
    var api;
    for (var apiName in API_CFG) {
      api = API_CFG[apiName];
      discoveredResource = _.get(api, ["resources", resource.version, primaryResource]);
      if (!discoveredResource) {
        continue;
      }
      return {
        resource: resource.resource,
        version:  resource.version,
        hostPort: api.hostPort,
        prefix:   api.prefix,
        namespaced: discoveredResource.namespaced,
        verbs: discoveredResource.verbs
      };
    }
    return undefined;
  };

  var invalidObjectKindOrVersion = function(apiObject) {
    var kind = "<none>";
    var version = "<none>";
    if (apiObject && apiObject.kind)       { kind    = apiObject.kind;       }
    if (apiObject && apiObject.apiVersion) { version = apiObject.apiVersion; }
    return "Invalid kind ("+kind+") or API version ("+version+")";
  };

  var unsupportedObjectKindOrVersion = function(apiObject) {
    var kind = "<none>";
    var version = "<none>";
    if (apiObject && apiObject.kind)       { kind    = apiObject.kind;       }
    if (apiObject && apiObject.apiVersion) { version = apiObject.apiVersion; }
    return "The API version "+version+" for kind " + kind + " is not supported by this server";
  };


  var excludeKindFromAPIGroupList = function(groupName, resourceKind) {
    return !!(
          _.find(API_DEDUPLICATION.kinds, {group: groupName, kind: resourceKind}) ||
          _.find(API_DEDUPLICATION.groups, {group: groupName})
      );
  };

  // Returns an array of available kinds, including their group
  var calculateAvailableKinds = function(includeClusterScoped) {
    var kinds = [];
    var rejectedKinds = _.map(Constants.AVAILABLE_KINDS_BLACKLIST, function(kind) {
      return _.isString(kind) ?
              { kind: kind, group: '' } :
              kind;
    });

    // ignore the legacy openshift kinds, these have been migrated to api groups
    _.each(_.pickBy(API_CFG, function(value, key) {
      return key !== 'openshift';
    }), function(api) {
      _.each(api.resources.v1, function(resource) {
        if (resource.namespaced || includeClusterScoped) {
          // Exclude subresources and any rejected kinds
          if (_.includes(resource.name, '/') || _.find(rejectedKinds, { kind: resource.kind, group: '' })) {
            return;
          }

          kinds.push({
            kind: resource.kind,
            group:  ''
          });
        }
      });
    });

   // Kinds under api groups
    _.each(APIS_CFG.groups, function(group) {

      // Use the console's default version first, and the server's preferred version second
      var preferredVersion = defaultVersion[group.name] || group.preferredVersion;
      _.each(group.versions[preferredVersion].resources, function(resource) {
        // Exclude subresources and any rejected kinds
        if (_.includes(resource.name, '/') || _.find(rejectedKinds, {kind: resource.kind, group: group.name})) {
          return;
        }


        if(excludeKindFromAPIGroupList(group.name, resource.kind)) {
          return;
        }

        if (resource.namespaced || includeClusterScoped) {
          kinds.push({
            kind: resource.kind,
            group: group.name
          });
        }
      });
    });

    return _.uniqBy(kinds, function(value) {
      return value.group + "/" + value.kind;
    });
  };

  var namespacedKinds = calculateAvailableKinds(false);
  var allKinds = calculateAvailableKinds(true);

  var availableKinds = function(includeClusterScoped) {
    return includeClusterScoped ? allKinds : namespacedKinds;
  };

  // Provides us a way to ensure we consistently use the
  // correct {resource, group} for API calls.  Version
  // will typically fallback to the preferredVersion of the API
  var getPreferredVersion = function(resource) {
    var preferred = API_PREFERRED_VERSIONS[resource];
    if(!preferred) {
      Logger.log("No preferred version for ", resource);
    }
    return preferred;
  };

  return {
    toAPIVersion: toAPIVersion,

    toResourceGroupVersion: toResourceGroupVersion,

    parseGroupVersion: parseGroupVersion,

    objectToResourceGroupVersion: objectToResourceGroupVersion,

    deriveTargetResource: deriveTargetResource,

    kindToResource: kindToResource,

    kindToResourceGroupVersion: kindToResourceGroupVersion,

    apiInfo: apiInfo,

    invalidObjectKindOrVersion: invalidObjectKindOrVersion,
    unsupportedObjectKindOrVersion: unsupportedObjectKindOrVersion,
    availableKinds: availableKinds,
    getPreferredVersion: getPreferredVersion
  };
});
;'use strict';

angular.module("openshiftCommonServices").
service("ApplicationsService", function(
  $q,
  APIService,
  DataService) {

  var deploymentsVersion = APIService.getPreferredVersion('deployments');
  var deploymentConfigsVersion = APIService.getPreferredVersion('deploymentconfigs');
  var replicationControllersVersion = APIService.getPreferredVersion('replicationcontrollers');
  var replicaSetsVersion = APIService.getPreferredVersion('replicasets');
  var statefulSetsVersion = APIService.getPreferredVersion('statefulsets');

  // List replication controllers in a namespace that are NOT managed by a
  // deployment config. Note: This will not return replication controllers that
  // have been orphaned by `oc delete dc/foo --cascade=false`.
  var listStandaloneReplicationControllers = function(context) {
    return DataService.list(replicationControllersVersion, context, null, {
      http: {
        params: {
          // If the replica set has a `openshift.io/deployment-config-name`
          // label, it's managed by a deployment config.
          labelSelector: "!openshift.io/deployment-config.name"
        }
      }
    });
  };

  // List replica sets in a namespace that are NOT managed by a deployment.
  // Note: This will not return replica sets that have been orphaned by
  // `oc delete deployment/foo --cascade=false`.
  var listStandaloneReplicaSets = function(context) {
    return DataService.list(replicaSetsVersion, context, null, {
      http: {
        params: {
          // If the replica set has a `pod-template-hash` label, it's managed
          // by a deployment.
          labelSelector: "!pod-template-hash"
        }
      }
    });
  };

  var getApplications = function(context) {
    var deferred = $q.defer();
    var promises = [];

    // Load all the "application" types
    promises.push(DataService.list(deploymentConfigsVersion, context));
    promises.push(listStandaloneReplicationControllers(context));
    promises.push(DataService.list(deploymentsVersion, context));
    promises.push(listStandaloneReplicaSets(context));
    promises.push(DataService.list(statefulSetsVersion, context));

    $q.all(promises).then(_.spread(function(deploymentConfigData, replicationControllerData, deploymentData, replicaSetData, statefulSetData) {
      var deploymentConfigs = _.toArray(deploymentConfigData.by('metadata.name'));
      var replicationControllers = _.toArray(replicationControllerData.by('metadata.name'));
      var deployments = _.toArray(deploymentData.by('metadata.name'));
      var replicaSets = _.toArray(replicaSetData.by('metadata.name'));
      var statefulSets = _.toArray(statefulSetData.by('metadata.name'));

      var apiObjects = deploymentConfigs.concat(deployments)
        .concat(replicationControllers)
        .concat(replicaSets)
        .concat(statefulSets);
      deferred.resolve(_.sortBy(apiObjects, ['metadata.name', 'kind']));
    }), function(e) {
      deferred.reject(e);
    });

    return deferred.promise;
  };

  return {
    listStandaloneReplicationControllers: listStandaloneReplicationControllers,
    listStandaloneReplicaSets: listStandaloneReplicaSets,
    getApplications: getApplications
  };
});
;'use strict';

angular.module('openshiftCommonServices')
// In a config step, set the desired user store and login service. For example:
//   AuthServiceProvider.setUserStore('LocalStorageUserStore')
//   AuthServiceProvider.setLoginService('RedirectLoginService')
//
// AuthService provides the following functions:
//   withUser()
//     returns a promise that resolves when there is a current user
//     starts a login if there is no current user
//   setUser(user, token[, ttl])
//     sets the current user and token to use for authenticated requests
//     if ttl is specified, it indicates how many seconds the user and token are valid
//     triggers onUserChanged callbacks if the new user is different than the current user
//   requestRequiresAuth(config)
//     returns true if the request is to a protected URL
//   addAuthToRequest(config)
//     adds auth info to the request, if available
//     if specified, uses config.auth.token as the token, otherwise uses the token store
//   startLogin()
//     returns a promise that is resolved when the login is complete
//   onLogin(callback)
//     the given callback is called whenever a login is completed
//   onUserChanged(callback)
//     the given callback is called whenever the current user changes
.provider('AuthService', function() {
  var _userStore = "";
  this.UserStore = function(userStoreName) {
    if (userStoreName) {
      _userStore = userStoreName;
    }
    return _userStore;
  };
  var _loginService = "";
  this.LoginService = function(loginServiceName) {
    if (loginServiceName) {
      _loginService = loginServiceName;
    }
    return _loginService;
  };
  var _logoutService = "";
  this.LogoutService = function(logoutServiceName) {
    if (logoutServiceName) {
      _logoutService = logoutServiceName;
    }
    return _logoutService;
  };

  var loadService = function(injector, name, setter) {
  	if (!name) {
  	  throw setter + " not set";
  	} else if (angular.isString(name)) {
  	  return injector.get(name);
  	} else {
  	  return injector.invoke(name);
  	}
  };

  this.$get = function($q, $injector, $log, $rootScope, Logger, base64) {
    var authLogger = Logger.get("auth");
    authLogger.log('AuthServiceProvider.$get', arguments);

    var _loginCallbacks = $.Callbacks();
    var _logoutCallbacks = $.Callbacks();
    var _userChangedCallbacks = $.Callbacks();

    var _loginPromise = null;
    var _logoutPromise = null;

    var userStore = loadService($injector, _userStore, "AuthServiceProvider.UserStore()");
    if (!userStore.available()) {
      Logger.error("AuthServiceProvider.$get user store " + _userStore + " not available");
    }
    var loginService = loadService($injector, _loginService, "AuthServiceProvider.LoginService()");
    var logoutService = loadService($injector, _logoutService, "AuthServiceProvider.LogoutService()");

    return {

      // Returns the configured user store
      UserStore: function() {
        return userStore;
      },

      // Returns true if currently logged in.
      isLoggedIn: function() {
        return !!userStore.getUser();
      },

      // Returns a promise of a user, which is resolved with a logged in user. Triggers a login if needed.
      withUser: function() {
        var user = userStore.getUser();
        if (user) {
          $rootScope.user = user;
          authLogger.log('AuthService.withUser()', user);
          return $q.when(user);
        } else {
          authLogger.log('AuthService.withUser(), calling startLogin()');
          return this.startLogin();
        }
      },

      setUser: function(user, token, ttl) {
        authLogger.log('AuthService.setUser()', user, token, ttl);
        var oldUser = userStore.getUser();
        userStore.setUser(user, ttl);
        userStore.setToken(token, ttl);

        $rootScope.user = user;

        var oldName = oldUser && oldUser.metadata && oldUser.metadata.name;
        var newName = user    && user.metadata    && user.metadata.name;
        if (oldName !== newName) {
          authLogger.log('AuthService.setUser(), user changed', oldUser, user);
          _userChangedCallbacks.fire(user);
        }
      },

      requestRequiresAuth: function(config) {
        var requiresAuth = !!config.auth;
        authLogger.log('AuthService.requestRequiresAuth()', config.url.toString(), requiresAuth);
        return requiresAuth;
      },
      addAuthToRequest: function(config) {
        // Use the given token, if provided
        var token = "";
        if (config && config.auth && config.auth.token) {
          token = config.auth.token;
          authLogger.log('AuthService.addAuthToRequest(), using token from request config', token);
        } else {
          token = userStore.getToken();
          authLogger.log('AuthService.addAuthToRequest(), using token from user store', token);
        }
        if (!token) {
          authLogger.log('AuthService.addAuthToRequest(), no token available');
          return false;
        }

        // Handle web socket requests with a parameter
        if (config.method === 'WATCH') {
          // Ensure protocols is defined
          config.protocols = config.protocols || [];

          // Ensure protocols is an array
          if (!_.isArray(config.protocols)) {
            config.protocols = [config.protocols];
          }

          // Ensure protocols has at least one item in it (for the server to echo back once the bearer protocol is stripped out)
          if (config.protocols.length == 0) {
            config.protocols.unshift("undefined");
          }

          // Prepend the bearer token protocol
          config.protocols.unshift("base64url.bearer.authorization.k8s.io."+base64.urlencode(token));

          authLogger.log('AuthService.addAuthToRequest(), added token protocol', config.protocols);
        } else {
          config.headers["Authorization"] = "Bearer " + token;
          authLogger.log('AuthService.addAuthToRequest(), added token header', config.headers["Authorization"]);
        }
        return true;
      },

      startLogin: function() {
        if (_loginPromise) {
          authLogger.log("Login already in progress");
          return _loginPromise;
        }
        var self = this;
        _loginPromise = loginService.login().then(function(result) {
          self.setUser(result.user, result.token, result.ttl);
          _loginCallbacks.fire(result.user);
        }).catch(function(err) {
          Logger.error(err);
        }).finally(function() {
          _loginPromise = null;
        });
        return _loginPromise;
      },

      startLogout: function() {
        if (_logoutPromise) {
          authLogger.log("Logout already in progress");
          return _logoutPromise;
        }
        var self = this;
        var user = userStore.getUser();
        var token = userStore.getToken();
        var wasLoggedIn = this.isLoggedIn();
        _logoutPromise = logoutService.logout(user, token).then(function() {
          authLogger.log("Logout service success");
        }).catch(function(err) {
          authLogger.error("Logout service error", err);
        }).finally(function() {
          // Clear the user and token
          self.setUser(null, null);
          // Make sure isLoggedIn() returns false before we fire logout callbacks
          var isLoggedIn = self.isLoggedIn();
          // Only fire logout callbacks if we transitioned from a logged in state to a logged out state
          if (wasLoggedIn && !isLoggedIn) {
            _logoutCallbacks.fire();
          }
          _logoutPromise = null;
        });
        return _logoutPromise;
      },

      // TODO: add a way to unregister once we start doing in-page logins
      onLogin: function(callback) {
        _loginCallbacks.add(callback);
      },
      // TODO: add a way to unregister once we start doing in-page logouts
      onLogout: function(callback) {
        _logoutCallbacks.add(callback);
      },
      // TODO: add a way to unregister once we start doing in-page user changes
      onUserChanged: function(callback) {
        _userChangedCallbacks.add(callback);
      }
    };
  };
})
// register the interceptor as a service
.factory('AuthInterceptor', ['$q', 'AuthService', function($q, AuthService) {
  var pendingRequestConfigs = [];
  // TODO: subscribe to user change events to empty the saved configs
  // TODO: subscribe to login events to retry the saved configs

  return {
    // If auth is not needed, or is already present, returns a config
    // If auth is needed and not present, starts a login flow and returns a promise of a config
    request: function(config) {
      // Requests that don't require auth can continue
      if (!AuthService.requestRequiresAuth(config)) {
        // console.log("No auth required", config.url);
        return config;
      }

      // If we could add auth info, we can continue
      if (AuthService.addAuthToRequest(config)) {
        // console.log("Auth added", config.url);
        return config;
      }

      // We should have added auth info, but couldn't

      // If we were specifically told not to trigger a login, return
      if (config.auth && config.auth.triggerLogin === false) {
        return config;
      }

      // 1. Set up a deferred and remember this config, so we can add auth info and resume once login is complete
      var deferred = $q.defer();
      pendingRequestConfigs.push([deferred, config, 'request']);
      // 2. Start the login flow
      AuthService.startLogin();
      // 3. Return the deferred's promise
      return deferred.promise;
    },

    responseError: function(rejection) {
      var authConfig = rejection.config.auth || {};

      // Requests that didn't require auth can continue
      if (!AuthService.requestRequiresAuth(rejection.config)) {
        // console.log("No auth required", rejection.config.url);
        return $q.reject(rejection);
      }

      // If we were specifically told not to trigger a login, return
      if (authConfig.triggerLogin === false) {
        return $q.reject(rejection);
      }

      // detect if this is an auth error (401) or other error we should trigger a login flow for
      var status = rejection.status;
      switch (status) {
        case 401:
          // console.log('responseError', status);
          // 1. Set up a deferred and remember this config, so we can add auth info and retry once login is complete
          var deferred = $q.defer();
          pendingRequestConfigs.push([deferred, rejection.config, 'responseError']);
          // 2. Start the login flow
          AuthService.startLogin();
          // 3. Return the deferred's promise
          return deferred.promise;
        default:
          return $q.reject(rejection);
      }
    }
  };
}]);
;'use strict';

angular.module("openshiftCommonServices")
  .factory("AuthorizationService", function($q, $cacheFactory, Logger, $interval, APIService, DataService){

    var currentProject = null;
    var cachedRulesByProject = $cacheFactory('rulesCache', {
          number: 10
        });
    // Permisive mode will cause no checks to be done for the user actions.
    var permissiveMode = false;

    var REVIEW_RESOURCES = ["localresourceaccessreviews",
                        "localsubjectaccessreviews",
                        "resourceaccessreviews",
                        "selfsubjectaccessreviews",
                        "selfsubjectrulesreviews",
                        "subjectaccessreviews",
                        "subjectrulesreviews",
                        "podsecuritypolicyreviews",
                        "podsecuritypolicysubjectreviews",
                        "podsecuritypolicyselfsubjectreviews",
                        "tokenreviews"];

    // Transform data from:
    // rules = {resources: ["jobs"], apiGroups: ["extensions"], verbs:["create","delete","get","list","update"]}
    // into:
    // normalizedRules = {"extensions": {"jobs": ["create","delete","get","list","update"]}}
    var normalizeRules = function(rules) {
      var normalizedRules = {};
      _.each(rules, function(rule) {
        _.each(rule.apiGroups, function(apiGroup) {
          if (!normalizedRules[apiGroup]) {
            normalizedRules[apiGroup] = {};
          }
          _.each(rule.resources, function(resource) {
            normalizedRules[apiGroup][resource] = rule.verbs;
          });
        });
      });
      return normalizedRules;
    };

    // Check if resource name meets one of following conditions, since those resources can't be create/update via `Add to project` page:
    //  - 'projectrequests'
    //  - subresource that contains '/', eg: 'builds/source', 'builds/logs', ...
    //  - resource is in REVIEW_RESOURCES list
    var checkResource = function(resource) {
      if (resource === "projectrequests" || _.includes(resource, "/") || _.includes(REVIEW_RESOURCES, resource)) {
        return false;
      } else {
        return true;
      }
    };

    // Check if user can create/update any resource on the 'Add to project' so the button will be displayed.
    var canAddToProjectCheck = function(rules) {
      return _.some(rules, function(rule) {
        return _.some(rule.resources, function(resource) {
          return checkResource(resource) && !_.isEmpty(_.intersection(rule.verbs ,(["*", "create", "update"])));
        });
      });
    };

    // Avoid loading rules twice if another request is already in flight. Key
    // is the project name, value is the promise.
    var inFlightRulesRequests = {};

    // forceRefresh is a boolean to bust the cache & request new perms
    var getProjectRules = function(projectName, forceRefresh) {
      var deferred = $q.defer();
      currentProject = projectName;
      var projectRules = cachedRulesByProject.get(projectName);
      var rulesResource = "selfsubjectrulesreviews";
      if (!projectRules || projectRules.forceRefresh || forceRefresh) {
        // Check if APIserver contains 'selfsubjectrulesreviews' resource. If not switch to permissive mode.
        if (APIService.apiInfo(rulesResource)) {
          // If a request is already in flight, return the promise for that request.
          if (inFlightRulesRequests[projectName]) {
            return inFlightRulesRequests[projectName];
          }

          Logger.log("AuthorizationService, loading user rules for " + projectName + " project");
          inFlightRulesRequests[projectName] = deferred.promise;
          var resourceGroupVersion = {
            kind: "SelfSubjectRulesReview",
            apiVersion: "v1"
          };
          DataService.create(rulesResource, null, resourceGroupVersion, {namespace: projectName}).then(
            function(data) {
              var normalizedData = normalizeRules(data.status.rules);
              var canUserAddToProject = canAddToProjectCheck(data.status.rules);
              cachedRulesByProject.put(projectName, {rules: normalizedData,
                                                      canAddToProject: canUserAddToProject,
                                                      forceRefresh: false,
                                                      cacheTimestamp: _.now()
                                                    });
              deferred.resolve();
            }, function() {
              permissiveMode = true;
              deferred.resolve();
          }).finally(function() {
            delete inFlightRulesRequests[projectName];
          });
        } else {
          Logger.log("AuthorizationService, resource 'selfsubjectrulesreviews' is not part of APIserver. Switching into permissive mode.");
          permissiveMode = true;
          deferred.resolve();
        }
      } else {
        // Using cached data.
        Logger.log("AuthorizationService, using cached rules for " + projectName + " project");
        if ((_.now() - projectRules.cacheTimestamp) >= 600000) {
          projectRules.forceRefresh = true;
        }
        deferred.resolve();
      }
      return deferred.promise;
    };

    var getRulesForProject = function(projectName) {
      return _.get(cachedRulesByProject.get(projectName || currentProject), ['rules']);
    };

    // _canI checks whether any rule allows the specified verb (directly or via a wildcard verb) on the literal group and resource.
    var _canI = function(rules, verb, group, resource) {
      var resources = rules[group];
      if (!resources) {
        return false;
      }
      var verbs = resources[resource];
      if (!verbs) {
        return false;
      }
      return _.includes(verbs, verb) || _.includes(verbs, '*');
    };

    // canI checks whether any rule allows the specified verb on the specified group-resource (directly or via a wildcard rule).
    var canI = function(resource, verb, projectName) {
      if (permissiveMode) {
        return true;
      }

      // normalize to structured form
      var r = APIService.toResourceGroupVersion(resource);
      var rules = getRulesForProject(projectName || currentProject);
      if (!rules) {
        return false;
      }
      return _canI(rules, verb, r.group, r.resource) ||
             _canI(rules, verb, '*',     '*'       ) ||
             _canI(rules, verb, r.group, '*'       ) ||
             _canI(rules, verb, '*',     r.resource);
    };

    var canIAddToProject = function(projectName) {
      if (permissiveMode) {
        return true;
      } else {
        return !!_.get(cachedRulesByProject.get(projectName || currentProject), ['canAddToProject']);
      }
    };

    return {
      checkResource: checkResource,
      getProjectRules: getProjectRules,
      canI: canI,
      canIAddToProject: canIAddToProject,
      getRulesForProject: getRulesForProject
    };
  });
;'use strict';

angular.module('openshiftCommonServices')
  .factory('base64util', function() {
    return {
      pad: function(data){
        if (!data) { return ""; }
        switch (data.length % 4) {
          case 1:  return data + "===";
          case 2:  return data + "==";
          case 3:  return data + "=";
          default: return data;
        }
      }
    };
  });
;'use strict';

angular.module("openshiftCommonServices")
  .service("BindingService",
           function($filter,
                    $q,
                    APIService,
                    AuthService,
                    DataService,
                    DNS1123_SUBDOMAIN_VALIDATION) {
    // The secret key this service uses for the parameters JSON blob when binding.
    var PARAMETERS_SECRET_KEY = 'parameters';

    var serviceBindingsVersion = APIService.getPreferredVersion('servicebindings');
    var secretsVersion = APIService.getPreferredVersion('secrets');

    var getServiceClassForInstance = function(serviceInstance, serviceClasses) {
      if (!serviceClasses) {
        return null;
      }

      var serviceClassName = _.get(serviceInstance, 'spec.clusterServiceClassRef.name');
      if (!serviceClassName) {
        return null;
      }

      return serviceClasses[serviceClassName];
    };

    var generateName = $filter('generateName');
    var generateSecretName = function(prefix) {
      var generateNameLength = 5;
      // Truncate the class name if it's too long to append the generated name suffix.
      var secretNamePrefix = _.truncate(prefix, {
        // `generateNameLength - 1` because we append a '-' and then a 5 char generated suffix
        length: DNS1123_SUBDOMAIN_VALIDATION.maxlength - generateNameLength - 1,
        omission: ''
      });

      return generateName(secretNamePrefix, generateNameLength);
    };

    var makeParametersSecret = function(secretName, parameters, owner) {
      var secret = {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: secretName,
          ownerReferences: [{
            apiVersion: owner.apiVersion,
            kind: owner.kind,
            name: owner.metadata.name,
            uid: owner.metadata.uid,
            controller: false,
            // TODO: Change to true when garbage collection works with service
            // catalog resources. Setting to true now results in a 403 Forbidden
            // error creating the secret.
            blockOwnerDeletion: false
          }]
        },
        type: 'Opaque',
        stringData: {}
      };

      secret.stringData[PARAMETERS_SECRET_KEY] = JSON.stringify(parameters);
      return secret;
    };

    var makeBinding = function(serviceInstance, application, parametersSecretName) {
      var instanceName = serviceInstance.metadata.name;

      var credentialSecretName = generateSecretName(serviceInstance.metadata.name + '-credentials-');
      var binding = {
        kind: 'ServiceBinding',
        apiVersion: 'servicecatalog.k8s.io/v1beta1',
        metadata: {
          generateName: instanceName + '-'
        },
        spec: {
          instanceRef: {
            name: instanceName
          },
          secretName: credentialSecretName
        }
      };

      if (parametersSecretName) {
        binding.spec.parametersFrom = [{
          secretKeyRef: {
            name: parametersSecretName,
            key: PARAMETERS_SECRET_KEY
          }
        }];
      }

      var appSelector = _.get(application, 'spec.selector');
      if (appSelector) {
        if (!appSelector.matchLabels && !appSelector.matchExpressions) {
          // Then this is the old format of selector, pod preset requires the new format
          appSelector = {
            matchLabels: appSelector
          };
        }
        binding.spec.alphaPodPresetTemplate = {
          name: credentialSecretName,
          selector: appSelector
        };
      }

      return binding;
    };

    var isServiceBindable = function(serviceInstance, serviceClass, servicePlan) {
      if (!serviceInstance || !serviceClass || !servicePlan) {
        return false;
      }

      // If being deleted, it is not bindable
      if (_.get(serviceInstance, 'metadata.deletionTimestamp')) {
        return false;
      }

      // If provisioning failed, the service is not bindable
      if ($filter('isServiceInstanceFailed')(serviceInstance, 'Failed')) {
        return false;
      }

      var planBindable = _.get(servicePlan, 'spec.bindable');
      if (planBindable === true) {
        return true;
      }
      if (planBindable === false) {
        return false;
      }

      // If `plan.spec.bindable` is not set, fall back to `serviceClass.spec.bindable`.
      return serviceClass.spec.bindable;
    };

    var getPodPresetSelectorsForBindings = function(bindings) {
      // Build a map of pod preset selectors by binding name.
      var podPresetSelectors = {};
      _.each(bindings, function(binding) {
        var podPresetSelector = _.get(binding, 'spec.alphaPodPresetTemplate.selector');
        if (podPresetSelector) {
          podPresetSelectors[binding.metadata.name] = new LabelSelector(podPresetSelector);
        }
      });

      return podPresetSelectors;
    };

    var getBindingsForResource = function(bindings, apiObject) {
      if (_.get(apiObject, 'kind') === 'ServiceInstance') {
        return _.filter(bindings, ['spec.instanceRef.name', _.get(apiObject, 'metadata.name')]);
      }

      var podPresetSelectors = getPodPresetSelectorsForBindings(bindings);

      // Create a selector for the potential binding target to check if the
      // pod preset covers the selector.
      var applicationSelector = new LabelSelector(_.get(apiObject, 'spec.selector'));

      var resourceBindings = [];

      // Look at each pod preset selector to see if it covers this API object selector.
      _.each(podPresetSelectors, function(podPresetSelector, bindingName) {
        if (podPresetSelector.covers(applicationSelector)) {
          // Keep a map of the target UID to the binding and the binding to
          // the target. We want to show bindings both in the "application"
          // object rows and the service instance rows.
          resourceBindings.push(bindings[bindingName]);
        }
      });

      return resourceBindings;
    };

    var filterBindableServiceInstances = function(serviceInstances, serviceClasses, servicePlans) {
      if (!serviceInstances || !serviceClasses || !servicePlans) {
        return null;
      }

      return _.filter(serviceInstances, function (serviceInstance) {
        var serviceClassName = _.get(serviceInstance, 'spec.clusterServiceClassRef.name');
        var servicePlanName = _.get(serviceInstance, 'spec.clusterServicePlanRef.name');
        return isServiceBindable(serviceInstance, serviceClasses[serviceClassName], servicePlans[servicePlanName]);
      });
    };

    var sortServiceInstances = function(serviceInstances, serviceClasses) {
      var getServiceClassDisplayName = function(serviceInstance) {
        var serviceClassName = _.get(serviceInstance, 'spec.clusterServiceClassRef.name');
        return _.get(serviceClasses, [serviceClassName, 'spec', 'externalMetadata', 'displayName']) || serviceInstance.spec.clusterServiceClassExternalName;
      };

      return _.sortBy(serviceInstances, [ getServiceClassDisplayName, 'metadata.name' ]);
    };

    return {
      bindingResource: serviceBindingsVersion,
      getServiceClassForInstance: getServiceClassForInstance,
      makeParametersSecret: makeParametersSecret,
      generateSecretName: generateSecretName,

      // Create a binding for `serviceInstance`. If an `application` API object
      // is specified, also create a pod preset for that application using its
      // `spec.selector`. `serviceClass` is required to determine if any
      // parameters need to be set when creating the binding.
      bindService: function(serviceInstance, application, serviceClass, parameters) {
        var parametersSecretName;
        if (!_.isEmpty(parameters)) {
          parametersSecretName = generateSecretName(serviceInstance.metadata.name + '-bind-parameters-');
        }

        var newBinding = makeBinding(serviceInstance, application, parametersSecretName);
        var context = {
          namespace: serviceInstance.metadata.namespace
        };

        var promise = DataService.create(serviceBindingsVersion, null, newBinding, context);
        if (!parametersSecretName) {
          return promise;
        }

        // Create the secret as well if the binding has parameters.
        return promise.then(function(binding) {
          var parametersSecret = makeParametersSecret(parametersSecretName, parameters, binding);
          return DataService.create(secretsVersion, null, parametersSecret, context).then(function() {
            return binding;
          });
        });
      },

      isServiceBindable: isServiceBindable,
      getPodPresetSelectorsForBindings: getPodPresetSelectorsForBindings,
      getBindingsForResource: getBindingsForResource,
      filterBindableServiceInstances: filterBindableServiceInstances,
      sortServiceInstances: sortServiceInstances
    };
  });
;'use strict';

angular.module('openshiftCommonServices')
  .factory('Constants', function() {
    var constants = _.clone(window.OPENSHIFT_CONSTANTS || {});
    var version = _.clone(window.OPENSHIFT_VERSION || {});
    constants.VERSION = version;
    return constants;
  });
;'use strict';
/* jshint eqeqeq: false, unused: false, expr: true */

angular.module('openshiftCommonServices')
.factory('DataService', function($cacheFactory, $http, $ws, $rootScope, $q, API_CFG, APIService, Logger, $timeout, base64, base64util) {

  // Accept PartialObjectMetadataList. Unfortunately we can't use the Accept
  // header to fallback to JSON due to an API server content negotiation bug.
  // https://github.com/kubernetes/kubernetes/issues/50519
  //
  // This is a potential version skew issue for when the web console runs in
  // a pod where we potentially need to support different server versions.
  // https://trello.com/c/9oaUh8xP
  var ACCEPT_PARTIAL_OBJECT_METADATA_LIST = 'application/json;as=PartialObjectMetadataList;v=v1alpha1;g=meta.k8s.io';

  function Data(array) {
    this._data = {};
    this._objectsByAttribute(array, "metadata.name", this._data);
  }

  Data.prototype.by = function(attr) {
    // TODO store already generated indices
    if (attr === "metadata.name") {
      return this._data;
    }
    var map = {};
    for (var key in this._data) {
      _objectByAttribute(this._data[key], attr, map, null);
    }
    return map;

  };

  Data.prototype.update = function(object, action) {
    _objectByAttribute(object, "metadata.name", this._data, action);
  };


  // actions is whether the object was (ADDED|DELETED|MODIFIED).  ADDED is assumed if actions is not
  // passed.  If objects is a hash then actions must be a hash with the same keys.  If objects is an array
  // then actions must be an array of the same order and length.
  Data.prototype._objectsByAttribute = function(objects, attr, map, actions) {
    angular.forEach(objects, function(obj, key) {
      _objectByAttribute(obj, attr, map, actions ? actions[key] : null);
    });
  };

  // Handles attr with dot notation
  // TODO write lots of tests for this helper
  // Note: this lives outside the Data prototype for now so it can be used by the helper in DataService as well
  function _objectByAttribute(obj, attr, map, action) {
    var subAttrs = attr.split(".");
    var attrValue = obj;
    for (var i = 0; i < subAttrs.length; i++) {
      attrValue = attrValue[subAttrs[i]];
      if (attrValue === undefined) {
        return;
      }
    }

    if ($.isArray(attrValue)) {
      // TODO implement this when we actually need it
    }
    else if ($.isPlainObject(attrValue)) {
      for (var key in attrValue) {
        var val = attrValue[key];
        if (!map[key]) {
          map[key] = {};
        }
        if (action === "DELETED") {
          delete map[key][val];
        }
        else {
          map[key][val] = obj;
        }
      }
    }
    else {
      if (action === "DELETED") {
        delete map[attrValue];
      }
      else {
        map[attrValue] = obj;
      }
    }
  }

  // If several connection errors happen close together, display them as one
  // notification. This prevents us spamming the user with many failed requests
  // at once.
  var queuedErrors = [];
  var addQueuedNotifications = _.debounce(function() {
    if (!queuedErrors.length) {
      return;
    }

    // Show all queued messages together. If the details is extremely long, it
    // will be truncated with a see more link.
    var notification = {
      type: 'error',
      message: 'An error occurred connecting to the server.',
      details: queuedErrors.join('\n'),
      links: [{
        label: 'Refresh',
        onClick: function() {
          window.location.reload();
        }
      }]
    };

    // Use `$rootScope.$emit` instead of NotificationsService directly
    // so that DataService doesn't add a dependency on `openshiftCommonUI`
    $rootScope.$emit('NotificationsService.addNotification', notification);

    // Clear the queue.
    queuedErrors = [];
  }, 300, { maxWait: 1000 });

  var showRequestError = function(message, status) {
    if (status) {
      message += " (status " + status + ")";
    }
    // Queue the message and call debounced `addQueuedNotifications`.
    queuedErrors.push(message);
    addQueuedNotifications();
  };

  function DataService() {
    this._listDeferredMap = {};
    this._watchCallbacksMap = {};
    this._watchObjectCallbacksMap = {};
    this._watchOperationMap = {};
    this._listOperationMap = {};
    this._resourceVersionMap = {};
    this._dataCache = $cacheFactory('dataCache', {
      // 25 is a reasonable number to keep at least one or two projects worth of data in cache
      number: 25
    });
    this._immutableDataCache = $cacheFactory('immutableDataCache', {
      // 50 is a reasonable number for the immutable resources that are stored per resource instead of grouped by type
      number: 50
    });
    this._watchOptionsMap = {};
    this._watchWebsocketsMap = {};
    this._watchPollTimeoutsMap = {};
    this._websocketEventsMap = {};

    var self = this;
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
      self._websocketEventsMap = {};
    });
  }

// resource:  API resource (e.g. "pods")
// context:   API context (e.g. {project: "..."})
// callback:  (optional) function to be called with the list of the requested resource and context,
//            parameters passed to the callback:
//            Data:   a Data object containing the (context-qualified) results
//                    which includes a helper method for returning a map indexed
//                    by attribute (e.g. data.by('metadata.name'))
// opts:      http - options to pass to the inner $http call
//            partialObjectMetadataList - if true, request only the metadata for each object
//
// returns a promise
  DataService.prototype.list = function(resource, context, callback, opts) {
    resource = APIService.toResourceGroupVersion(resource);
    var key = this._uniqueKey(resource, null, context, opts);
    var deferred = this._listDeferred(key);
    if (callback) {
      deferred.promise.then(callback);
    }

    if (this._isCached(key)) {
      // A watch operation is running, and we've already received the
      // initial set of data for this resource
      deferred.resolve(this._data(key));
    }
    else if (this._listInFlight(key)) {
      // no-op, our callback will get called when listOperation completes
    }
    else {
      this._startListOp(resource, context, opts);
    }
    return deferred.promise;
  };

// resource:  API resource (e.g. "pods")
// name:      API name, the unique name for the object
// context:   API context (e.g. {project: "..."})
// opts:
//   http - options to pass to the inner $http call
//   gracePeriodSeconds - duration in seconds to wait before deleting the resource
// Returns a promise resolved with response data or rejected with {data:..., status:..., headers:..., config:...} when the delete call completes.
  DataService.prototype.delete = function(resource, name, context, opts) {
    resource = APIService.toResourceGroupVersion(resource);
    opts = opts || {};
    var deferred = $q.defer();
    var self = this;
    var data, headers = {};
    var data = {
      kind: "DeleteOptions",
      apiVersion: "v1"
    };
    if (_.has(opts, 'propagationPolicy')) {
      // Use a has check so that explicitly setting propagationPolicy to null passes through and doesn't fallback to default behavior
      data.propagationPolicy = opts.propagationPolicy;
    }
    else {
      // Default to "Foreground" (cascading) if no propagationPolicy was given.
      data.propagationPolicy = 'Foreground';
    }
    var headers = {
      'Content-Type': 'application/json'
    };
    // Differentiate between 0 and undefined
    if (_.has(opts, 'gracePeriodSeconds')) {
      data.gracePeriodSeconds = opts.gracePeriodSeconds;
    }
    this._getNamespace(resource, context, opts).then(function(ns){
      $http(angular.extend({
        method: 'DELETE',
        auth: {},
        data: data,
        headers: headers,
        url: self._urlForResource(resource, name, context, false, ns)
      }, opts.http || {}))
      .success(function(data, status, headerFunc, config, statusText) {
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        deferred.reject({
          data: data,
          status: status,
          headers: headers,
          config: config
        });
      });
    });
    return deferred.promise;
  };


// resource:  API resource (e.g. "pods")
// name:      API name, the unique name for the object
// object:    API object data(eg. { kind: "Build", parameters: { ... } } )
// context:   API context (e.g. {project: "..."})
// opts:      http - options to pass to the inner $http call
// Returns a promise resolved with response data or rejected with {data:..., status:..., headers:..., config:...} when the delete call completes.
  DataService.prototype.update = function(resource, name, object, context, opts) {
    resource = APIService.deriveTargetResource(resource, object);
    opts = opts || {};
    var deferred = $q.defer();
    var self = this;
    this._getNamespace(resource, context, opts).then(function(ns){
      $http(angular.extend({
        method: 'PUT',
        auth: {},
        data: object,
        url: self._urlForResource(resource, name, context, false, ns)
      }, opts.http || {}))
      .success(function(data, status, headerFunc, config, statusText) {
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        deferred.reject({
          data: data,
          status: status,
          headers: headers,
          config: config
        });
      });
    });
    return deferred.promise;
  };

// TODO: Enable PATCH when it's added to CORS Access-Control-Allow-Methods

// resource:  API resource group version object (e.g. { group: "", resource: "pods", version: "v1" }).
//            Must be the full resource group version because it can't be derived from the patch object.
// name:      API name, the unique name for the object
// object:    API object data(eg. { kind: "Build", parameters: { ... } } )
// context:   API context (e.g. {project: "..."})
// opts:      http - options to pass to the inner $http call
// Returns a promise resolved with response data or rejected with {data:..., status:..., headers:..., config:...} when the delete call completes.
// DataService.prototype.patch = function(resourceGroupVersion, name, object, context, opts) {
//   opts = opts || {};
//   var deferred = $q.defer();
//   var self = this;
//   this._getNamespace(resourceGroupVersion, context, opts).then(function(ns){
//     $http(angular.extend({
//       method: 'PATCH',
//       auth: {},
//       data: object,
//       url: self._urlForResource(resourceGroupVersion, name, context, false, ns)
//     }, opts.http || {}))
//     .success(function(data, status, headerFunc, config, statusText) {
//       deferred.resolve(data);
//     })
//     .error(function(data, status, headers, config) {
//       deferred.reject({
//         data: data,
//         status: status,
//         headers: headers,
//         config: config
//       });
//     });
//   });
//   return deferred.promise;
// };

// resource:  API resource (e.g. "pods")
// name:      API name, the unique name for the object.
//            In case the name of the Object is provided, expected format of 'resource' parameter is 'resource/subresource', eg: 'buildconfigs/instantiate'.
// object:    API object data(eg. { kind: "Build", parameters: { ... } } )
// context:   API context (e.g. {project: "..."})
// opts:      http - options to pass to the inner $http call
// Returns a promise resolved with response data or rejected with {data:..., status:..., headers:..., config:...} when the delete call completes.
  DataService.prototype.create = function(resource, name, object, context, opts) {
    resource = APIService.deriveTargetResource(resource, object);
    opts = opts || {};
    var deferred = $q.defer();
    var self = this;
    this._getNamespace(resource, context, opts).then(function(ns){
      $http(angular.extend({
        method: 'POST',
        auth: {},
        data: object,
        url: self._urlForResource(resource, name, context, false, ns)
      }, opts.http || {}))
      .success(function(data, status, headerFunc, config, statusText) {
        deferred.resolve(data);
      })
      .error(function(data, status, headers, config) {
        deferred.reject({
          data: data,
          status: status,
          headers: headers,
          config: config
        });
      });
    });
    return deferred.promise;
  };

  // objects:   Array of API object data(eg. [{ kind: "Build", parameters: { ... } }] )
  // context:   API context (e.g. {project: "..."})
  // opts:      action - defines the REST action that will be called
  //                   - available actions: create, update
  //            http - options to pass to the inner $http call
  // Returns a promise resolved with an an object like: { success: [], failure: [] }
  // where success and failure contain an array of results from the individual
  // create calls.
  DataService.prototype.batch = function(objects, context, action, opts) {
    var deferred = $q.defer();
    var successResults = [];
    var failureResults = [];
    var self = this;
    var remaining = objects.length;
    action = action || 'create';

    function _checkDone() {
      if (remaining === 0) {
        deferred.resolve({ success: successResults, failure: failureResults });
      }
    }

    _.each(objects, function(object) {
      var resource = APIService.objectToResourceGroupVersion(object);
      if (!resource) {
        // include the original object, so the error handler can display the kind/name
        failureResults.push({object: object, data: {message: APIService.invalidObjectKindOrVersion(object)}});
        remaining--;
        _checkDone();
        return;
      }
      if (!APIService.apiInfo(resource)) {
        // include the original object, so the error handler can display the kind/name
        failureResults.push({object: object, data: {message: APIService.unsupportedObjectKindOrVersion(object)}});
        remaining--;
        _checkDone();
        return;
      }

      var success = function(data) {
        // include the original object, so the error handler can display the kind/name
        data.object = object;
        successResults.push(data);
        remaining--;
        _checkDone();
      };
      var failure = function(data) {
        // include the original object, so the handler can display the kind/name
        data.object = object;
        failureResults.push(data);
        remaining--;
        _checkDone();
      };

      switch(action) {
      case "create":
        self.create(resource, null, object, context, opts).then(success, failure);
        break;
      case "update":
        self.update(resource, object.metadata.name, object, context, opts).then(success, failure);
        break;
      default:
        // default case to prevent unspecified actions and typos
        return deferred.reject({
          data: "Invalid '" + action + "'  action.",
          status: 400,
          headers: function() { return null; },
          config: {},
          object: object
        });
      }
    });
    return deferred.promise;
  };

// resource:  API resource (e.g. "pods")
// name:      API name, the unique name for the object
// context:   API context (e.g. {project: "..."})
// opts:      force - always request (default is false)
//            http - options to pass to the inner $http call
//            errorNotification - will popup an error notification if the API request fails (default true)
  DataService.prototype.get = function(resource, name, context, opts) {
    resource = APIService.toResourceGroupVersion(resource);
    opts = opts || {};
    var key = this._uniqueKey(resource, name, context, opts);
    var force = !!opts.force;
    delete opts.force;

    var deferred = $q.defer();

    var existingImmutableData = this._immutableData(key);

    // special case, if we have an immutable item, we can return it immediately
    if (this._hasImmutable(resource, existingImmutableData, name)) {
      $timeout(function() {
        // we can be guaranteed this wont change on us, just send what we have in existingData
        deferred.resolve(existingImmutableData.by('metadata.name')[name]);
      }, 0);
    }
    else {
      var self = this;
      this._getNamespace(resource, context, opts).then(function(ns){
        $http(angular.extend({
          method: 'GET',
          auth: {},
          url: self._urlForResource(resource, name, context, false, ns)
        }, opts.http || {}))
        .success(function(data, status, headerFunc, config, statusText) {
          if (self._isImmutable(resource)) {
            if (!existingImmutableData) {
              self._immutableData(key, [data]);
            }
            else {
              existingImmutableData.update(data, "ADDED");
            }
          }
          deferred.resolve(data);
        })
        .error(function(data, status, headers, config) {
          if (opts.errorNotification !== false) {
            showRequestError("Failed to get " + resource + "/" + name, status);
          }
          deferred.reject({
            data: data,
            status: status,
            headers: headers,
            config: config
          });
        });
      });
    }
    return deferred.promise;
  };

// TODO (bpeterse): Create a new Streamer service & get this out of DataService.
DataService.prototype.createStream = function(resource, name, context, opts, isRaw) {
  var self = this;
  resource = APIService.toResourceGroupVersion(resource);

  var protocols = isRaw ? 'binary.k8s.io' : 'base64.binary.k8s.io';
  var identifier = 'stream_';
  var openQueue = {};
  var messageQueue = {};
  var closeQueue = {};
  var errorQueue = {};

  var stream;
  var makeStream = function() {
     return self._getNamespace(resource, context, {})
                .then(function(params) {
                  var cumulativeBytes = 0;
                  return  $ws({
                            url: self._urlForResource(resource, name, context, true, _.extend(params, opts)),
                            auth: {},
                            onopen: function(evt) {
                              _.each(openQueue, function(fn) {
                                fn(evt);
                              });
                            },
                            onmessage: function(evt) {
                              if(!_.isString(evt.data)) {
                                Logger.log('log stream response is not a string', evt.data);
                                return;
                              }

                              var message;
                              if(!isRaw) {
                                message = base64.decode(base64util.pad(evt.data));
                                // Count bytes for log streams, which will stop when limitBytes is reached.
                                // There's no other way to detect we've reach the limit currently.
                                cumulativeBytes += message.length;
                              }

                              _.each(messageQueue, function(fn) {
                                if(isRaw) {
                                  fn(evt.data);
                                } else {
                                  fn(message, evt.data, cumulativeBytes);
                                }
                              });
                            },
                            onclose: function(evt) {
                              _.each(closeQueue, function(fn) {
                                fn(evt);
                              });
                            },
                            onerror: function(evt) {
                              _.each(errorQueue, function(fn) {
                                fn(evt);
                              });
                            },
                            protocols: protocols
                          }).then(function(ws) {
                            Logger.log("Streaming pod log", ws);
                            return ws;
                          });
                });
  };
  return {
    onOpen: function(fn) {
      if(!_.isFunction(fn)) {
        return;
      }
      var id = _.uniqueId(identifier);
      openQueue[id] = fn;
      return id;
    },
    onMessage: function(fn) {
      if(!_.isFunction(fn)) {
        return;
      }
      var id = _.uniqueId(identifier);
      messageQueue[id] = fn;
      return id;
    },
    onClose: function(fn) {
      if(!_.isFunction(fn)) {
        return;
      }
      var id = _.uniqueId(identifier);
      closeQueue[id] = fn;
      return id;
    },
    onError: function(fn) {
      if(!_.isFunction(fn)) {
        return;
      }
      var id = _.uniqueId(identifier);
      errorQueue[id] = fn;
      return id;
    },
    // can remove any callback from open, message, close or error
    remove: function(id) {
      if (openQueue[id]) { delete openQueue[id]; }
      if (messageQueue[id]) { delete messageQueue[id]; }
      if (closeQueue[id]) { delete closeQueue[id]; }
      if (errorQueue[id]) { delete errorQueue[id]; }
    },
    start: function() {
      stream = makeStream();
      return stream;
    },
    stop: function() {
      stream.then(function(ws) {
        ws.close();
      });
    }
  };
};


// resource:  API resource (e.g. "pods")
// context:   API context (e.g. {project: "..."})
// callback:  optional function to be called with the initial list of the requested resource,
//            and when updates are received, parameters passed to the callback:
//            Data:   a Data object containing the (context-qualified) results
//                    which includes a helper method for returning a map indexed
//                    by attribute (e.g. data.by('metadata.name'))
//            event:  specific event that caused this call ("ADDED", "MODIFIED",
//                    "DELETED", or null) callbacks can optionally use this to
//                    more efficiently process updates
//            obj:    specific object that caused this call (may be null if the
//                    entire list was updated) callbacks can optionally use this
//                    to more efficiently process updates
// opts:      options
//            poll:   true | false - whether to poll the server instead of opening
//                    a websocket. Default is false.
//            pollInterval: in milliseconds, how long to wait between polling the server
//                    only applies if poll=true.  Default is 5000.
//            http:   similar to .get, etc. at this point, only used to pass http.params for filtering
//            skipDigest: will skip the $apply & avoid triggering a digest loop
//                    if set to `true`.  Is intentionally the inverse of the invokeApply
//                    arg passed to $timeout (due to default values).
//            errorNotification: will popup an error notification if the API request fails (default true)
// returns handle to the watch, needed to unwatch e.g.
//        var handle = DataService.watch(resource,context,callback[,opts])
//        DataService.unwatch(handle)
  DataService.prototype.watch = function(resource, context, callback, opts) {
    resource = APIService.toResourceGroupVersion(resource);
    opts = opts || {};
    var invokeApply =  !opts.skipDigest;
    var key = this._uniqueKey(resource, null, context, opts);
    if (callback) {
      // If we were given a callback, add it
      this._watchCallbacks(key).add(callback);
    }
    else if (!this._watchCallbacks(key).has()) {
      // We can be called with no callback in order to re-run a list/watch sequence for existing callbacks
      // If there are no existing callbacks, return
      return {};
    }

    var existingWatchOpts = this._watchOptions(key);
    if (existingWatchOpts) {
      // Check any options for compatibility with existing watch
      if (!!existingWatchOpts.poll !== !!opts.poll) { // jshint ignore:line
        throw "A watch already exists for " + resource + " with a different polling option.";
      }
    }
    else {
      this._watchOptions(key, opts);
    }

    var self = this;
    if (this._isCached(key)) {
      if (callback) {
        $timeout(function() {
          callback(self._data(key));
        }, 0, invokeApply);
      }
    }
    else {
      if (callback) {
        var resourceVersion = this._resourceVersion(key);
        if (this._data(key)) {
          $timeout(function() {
            // If the cached data is still the latest that we have, send it to the callback
            if (resourceVersion === self._resourceVersion(key)) {
              callback(self._data(key)); // but just in case, still pull from the current data map
            }
          }, 0, invokeApply);
        }
      }
      if (!this._listInFlight(key)) {
        this._startListOp(resource, context, opts);
      }
    }

    // returned handle needs resource, context, and callback in order to unwatch
    return {
      resource: resource,
      context: context,
      callback: callback,
      opts: opts
    };
  };



// resource:  API resource (e.g. "pods")
// name:      API name, the unique name for the object
// context:   API context (e.g. {project: "..."})
// callback:  optional function to be called with the initial list of the requested resource,
//            and when updates are received, parameters passed to the callback:
//            obj:    the requested object
//            event:  specific event that caused this call ("ADDED", "MODIFIED",
//                    "DELETED", or null) callbacks can optionally use this to
//                    more efficiently process updates
// opts:      options
//            poll:   true | false - whether to poll the server instead of opening
//                    a websocket. Default is false.
//            pollInterval: in milliseconds, how long to wait between polling the server
//                    only applies if poll=true.  Default is 5000.
//
// returns handle to the watch, needed to unwatch e.g.
//        var handle = DataService.watch(resource,context,callback[,opts])
//        DataService.unwatch(handle)
  DataService.prototype.watchObject = function(resource, name, context, callback, opts) {
    resource = APIService.toResourceGroupVersion(resource);
    opts = opts || {};
    var key = this._uniqueKey(resource, name, context, opts);
    var wrapperCallback;
    if (callback) {
      // If we were given a callback, add it
      this._watchObjectCallbacks(key).add(callback);
      var self = this;
      wrapperCallback = function(items, event, item) {
        // If we got an event for a single item, only fire the callback if its the item we care about
        if (item && item.metadata.name === name) {
          self._watchObjectCallbacks(key).fire(item, event);
        }
        else if (!item) {
          // Otherwise its an initial listing, see if we can find the item we care about in the list
          var itemsByName = items.by("metadata.name");
          if (itemsByName[name]) {
            self._watchObjectCallbacks(key).fire(itemsByName[name]);
          }
        }
      };
    }
    else if (!this._watchObjectCallbacks(key).has()) {
      // This block may not be needed yet, don't expect this would get called without a callback currently...
      return {};
    }

    // For now just watch the type, eventually we may want to do something more complicated
    // and watch just the object if the type is not already being watched
    var handle = this.watch(resource, context, wrapperCallback, opts);
    handle.objectCallback = callback;
    handle.objectName = name;

    return handle;
  };

  DataService.prototype.unwatch = function(handle) {
    var resource = handle.resource;
    var objectName = handle.objectName;
    var context = handle.context;
    var callback = handle.callback;
    var objectCallback = handle.objectCallback;
    var opts = handle.opts;
    var key = this._uniqueKey(resource, null, context, opts);

    if (objectCallback && objectName) {
      var objectKey = this._uniqueKey(resource, objectName, context, opts);
      var objCallbacks = this._watchObjectCallbacks(objectKey);
      objCallbacks.remove(objectCallback);
    }

    var callbacks = this._watchCallbacks(key);
    if (callback) {
      callbacks.remove(callback);
    }
    if (!callbacks.has()) {
      if (opts && opts.poll) {
        clearTimeout(this._watchPollTimeouts(key));
        this._watchPollTimeouts(key, null);
      }
      else if (this._watchWebsockets(key)){
        // watchWebsockets may not have been set up yet if the projectPromise never resolves
        var ws = this._watchWebsockets(key);
        // Make sure the onclose listener doesn't reopen this websocket.
        ws.shouldClose = true;
        ws.close();
        this._watchWebsockets(key, null);
      }

      this._watchInFlight(key, false);
      this._watchOptions(key, null);
    }
  };

  // Takes an array of watch handles and unwatches them
  DataService.prototype.unwatchAll = function(handles) {
    for (var i = 0; i < handles.length; i++) {
      this.unwatch(handles[i]);
    }
  };

  DataService.prototype._watchCallbacks = function(key) {
    if (!this._watchCallbacksMap[key]) {
      this._watchCallbacksMap[key] = $.Callbacks();
    }
    return this._watchCallbacksMap[key];
  };

  DataService.prototype._watchObjectCallbacks = function(key) {
    if (!this._watchObjectCallbacksMap[key]) {
      this._watchObjectCallbacksMap[key] = $.Callbacks();
    }
    return this._watchObjectCallbacksMap[key];
  };

  DataService.prototype._listDeferred = function(key) {
    if (!this._listDeferredMap[key]) {
      this._listDeferredMap[key] = $q.defer();
    }
    return this._listDeferredMap[key];
  };

  DataService.prototype._watchInFlight = function(key, op) {
    if (!op && op !== false) {
      return this._watchOperationMap[key];
    }
    else {
      this._watchOperationMap[key] = op;
    }
  };

  DataService.prototype._listInFlight = function(key, op) {
    if (!op && op !== false) {
      return this._listOperationMap[key];
    }
    else {
      this._listOperationMap[key] = op;
    }
  };

  DataService.prototype._resourceVersion = function(key, rv) {
    if (!rv) {
      return this._resourceVersionMap[key];
    }
    else {
      this._resourceVersionMap[key] = rv;
    }
  };

  // uses $cacheFactory to impl LRU cache
  DataService.prototype._data = function(key, data) {
    return data ?
           this._dataCache.put(key, new Data(data)) :
           this._dataCache.get(key);
  };

    // uses $cacheFactory to impl LRU cache
  DataService.prototype._immutableData = function(key, data) {
    return data ?
           this._immutableDataCache.put(key, new Data(data)) :
           this._immutableDataCache.get(key);
  };

  DataService.prototype._isCached = function(key) {
    return this._watchInFlight(key) &&
           this._resourceVersion(key) &&
           (!!this._data(key));
  };

  DataService.prototype._watchOptions = function(key, opts) {
    if (opts === undefined) {
      return this._watchOptionsMap[key];
    }
    else {
      this._watchOptionsMap[key] = opts;
    }
  };

  DataService.prototype._watchPollTimeouts = function(key, timeout) {
    if (!timeout) {
      return this._watchPollTimeoutsMap[key];
    }
    else {
      this._watchPollTimeoutsMap[key] = timeout;
    }
  };

  DataService.prototype._watchWebsockets = function(key, timeout) {
    if (!timeout) {
      return this._watchWebsocketsMap[key];
    }
    else {
      this._watchWebsocketsMap[key] = timeout;
    }
  };

  // Maximum number of websocket events to track per resource/context in _websocketEventsMap.
  var maxWebsocketEvents = 10;

  DataService.prototype._addWebsocketEvent = function(key, eventType) {
    var events = this._websocketEventsMap[key];
    if (!events) {
      events = this._websocketEventsMap[key] = [];
    }

    // Add the event to the end of the array with the time in millis.
    events.push({
      type: eventType,
      time: Date.now()
    });

    // Only keep 10 events. Shift the array to make room for the new event.
    while (events.length > maxWebsocketEvents) { events.shift(); }
  };

  function isTooManyRecentEvents(events) {
    // If we've had more than 10 events in 30 seconds, stop.
    // The oldest event is at index 0.
    var recentDuration = 1000 * 30;
    return events.length >= maxWebsocketEvents && (Date.now() - events[0].time) < recentDuration;
  }

  function isTooManyConsecutiveCloses(events) {
    var maxConsecutiveCloseEvents = 5;
    if (events.length < maxConsecutiveCloseEvents) {
      return false;
    }

    // Make sure the last 5 events were not close events, which means the
    // connection is not succeeding. This check is necessary if connection
    // timeouts take longer than 6 seconds.
    for (var i = events.length - maxConsecutiveCloseEvents; i < events.length; i++) {
      if (events[i].type !== 'close') {
        return false;
      }
    }

    return true;
  }

  DataService.prototype._isTooManyWebsocketRetries = function(key) {
    var events = this._websocketEventsMap[key];
    if (!events) {
      return false;
    }

    if (isTooManyRecentEvents(events)) {
      Logger.log("Too many websocket open or close events for resource/context in a short period", key, events);
      return true;
    }

    if (isTooManyConsecutiveCloses(events)) {
      Logger.log("Too many consecutive websocket close events for resource/context", key, events);
      return true;
    }

    return false;
  };


  // will take an object, filter & sort it for consistent unique key generation
  // uses encodeURIComponent internally because keys can have special characters, such as '='
  var paramsForKey = function(params) {
    var keys = _.keysIn(
                  _.pick(
                    params,
                    ['fieldSelector', 'labelSelector'])
                ).sort();
    return _.reduce(
            keys,
            function(result, key, i) {
              return result + key + '=' + encodeURIComponent(params[key]) +
                      ((i < (keys.length-1)) ? '&' : '');
            }, '?');

  };


  // - creates a unique key representing a resource in its context (project)
  //    - primary use case for caching
  //    - proxies to _urlForResource to generate unique keys
  // - ensure namespace if available
  // - ensure only witelisted url params used for keys (fieldSelector, labelSelector) via paramsForKey
  //   and that these are consistently ordered
  // - ensure that requests with different Accept request headers have different keys
  // - NOTE: Do not use the key as your url for API requests. This function does not use the 'isWebsocket'
  //         bool.  Both websocket & http operations should respond with the same data from cache if key matches
  //         so the unique key will always include http://
  DataService.prototype._uniqueKey = function(resource, name, context, opts) {
    var ns = context && context.namespace ||
             _.get(context, 'project.metadata.name') ||
             context.projectName;
    var params = _.get(opts, 'http.params');
    var url = this._urlForResource(resource, name, context, null, angular.extend({}, {}, {namespace: ns})).toString() + paramsForKey(params || {});
    if (_.get(opts, 'partialObjectMetadataList')) {
      // Make sure partial objects get a different cache key.
      return url + '#' + ACCEPT_PARTIAL_OBJECT_METADATA_LIST;
    }

    return url;
  };


  DataService.prototype._startListOp = function(resource, context, opts) {
    opts = opts || {};
    var params =  _.get(opts, 'http.params') || {};
    var key = this._uniqueKey(resource, null, context, opts);
    // mark the operation as in progress
    this._listInFlight(key, true);

    var headers = {};
    if (opts.partialObjectMetadataList) {
      headers.Accept = ACCEPT_PARTIAL_OBJECT_METADATA_LIST;
    }

    var self = this;
    if (context.projectPromise && !resource.equals("projects")) {
      context.projectPromise.done(function(project) {
        $http(angular.extend({
          method: 'GET',
          auth: {},
          headers: headers,
          url: self._urlForResource(resource, null, context, false, _.assign({}, params, {namespace: project.metadata.name}))
        }, opts.http || {}))
        .success(function(data, status, headerFunc, config, statusText) {
          self._listOpComplete(key, resource, context, opts, data);
        }).error(function(data, status, headers, config) {
          // mark list op as complete
          self._listInFlight(key, false);
          var deferred = self._listDeferred(key);
          delete self._listDeferredMap[key];
          deferred.reject({
            data: data,
            status: status,
            headers: headers,
            config: config
          });

          if (!_.get(opts, 'errorNotification', true)) {
            return;
          }

          showRequestError("Failed to list " + resource, status);
        });
      });
    }
    else {
      $http({
        method: 'GET',
        auth: {},
        headers: headers,
        url: this._urlForResource(resource, null, context, false, params),
      }).success(function(data, status, headerFunc, config, statusText) {
        self._listOpComplete(key, resource, context, opts, data);
      }).error(function(data, status, headers, config) {
        // mark list op as complete
        self._listInFlight(key, false);
        var deferred = self._listDeferred(key);
        delete self._listDeferredMap[key];
        deferred.reject({
          data: data,
          status: status,
          headers: headers,
          config: config
        });

        if (!_.get(opts, 'errorNotification', true)) {
          return;
        }

        showRequestError("Failed to list " + resource, status);
      });
    }
  };

  DataService.prototype._listOpComplete = function(key, resource, context, opts, data) {
    if (!data.items) {
      console.warn("List request for " + resource + " returned a null items array.  This is an invalid API response.");
    }
    var items = data.items || [];
    // Here we normalize all items to have a kind property.
    // One of the warts in the kubernetes REST API is that items retrieved
    // via GET on a list resource won't have a kind property set.
    // See: https://github.com/kubernetes/kubernetes/issues/3030
    if (data.kind && data.kind.indexOf("List") === data.kind.length - 4) {
      angular.forEach(items, function(item) {
        if (!item.kind) {
          item.kind = data.kind.slice(0, -4);
        }
        if (!item.apiVersion) {
          item.apiVersion = data.apiVersion;
        }
      });
    }

    // mark list op as complete
    this._listInFlight(key, false);
    var deferred = this._listDeferred(key);
    delete this._listDeferredMap[key];

    // Some responses might not have `data.metadata` (for instance, PartialObjectMetadataList).
    var resourceVersion = _.get(data, 'resourceVersion') || _.get(data, 'metadata.resourceVersion');
    this._resourceVersion(key, resourceVersion);
    this._data(key, items);
    deferred.resolve(this._data(key));
    this._watchCallbacks(key).fire(this._data(key));

    if (this._watchCallbacks(key).has()) {
      var watchOpts = this._watchOptions(key) || {};
      if (watchOpts.poll) {
        this._watchInFlight(key, true);
        this._watchPollTimeouts(key, setTimeout($.proxy(this, "_startListOp", resource, context), watchOpts.pollInterval || 5000));
      }
      else if (!this._watchInFlight(key)) {
        this._startWatchOp(key, resource, context, opts, this._resourceVersion(key));
      }
    }
  };

  DataService.prototype._startWatchOp = function(key, resource, context, opts, resourceVersion) {
    this._watchInFlight(key, true);
    // Note: current impl uses one websocket per resource
    // eventually want a single websocket connection that we
    // send a subscription request to for each resource

    // Only listen for updates if websockets are available
    if ($ws.available()) {
      var self = this;
      var params =  _.get(opts, 'http.params') || {};
      params.watch = true;
      if (resourceVersion) {
        params.resourceVersion = resourceVersion;
      }
      if (context.projectPromise && !resource.equals("projects")) {
        context.projectPromise.done(function(project) {
          params.namespace = project.metadata.name;
          $ws({
            method: "WATCH",
            url: self._urlForResource(resource, null, context, true, params),
            auth:      {},
            onclose:   $.proxy(self, "_watchOpOnClose",   resource, context, opts),
            onmessage: $.proxy(self, "_watchOpOnMessage", resource, context, opts),
            onopen:    $.proxy(self, "_watchOpOnOpen",    resource, context, opts)
          }).then(function(ws) {
            Logger.log("Watching", ws);
            self._watchWebsockets(key, ws);
          });
        });
      }
      else {
        $ws({
          method: "WATCH",
          url: self._urlForResource(resource, null, context, true, params),
          auth:      {},
          onclose:   $.proxy(self, "_watchOpOnClose",   resource, context, opts),
          onmessage: $.proxy(self, "_watchOpOnMessage", resource, context, opts),
          onopen:    $.proxy(self, "_watchOpOnOpen",    resource, context, opts)
        }).then(function(ws){
          Logger.log("Watching", ws);
          self._watchWebsockets(key, ws);
        });
      }
    }
  };

  DataService.prototype._watchOpOnOpen = function(resource, context, opts, event) {
    Logger.log('Websocket opened for resource/context', resource, context);
    var key = this._uniqueKey(resource, null, context, opts);
    this._addWebsocketEvent(key, 'open');
  };

  DataService.prototype._watchOpOnMessage = function(resource, context, opts, event) {
    var key = this._uniqueKey(resource, null, context, opts);
    opts = opts || {};
    var invokeApply = !opts.skipDigest;
    try {
      var eventData = $.parseJSON(event.data);

      if (eventData.type == "ERROR") {
        Logger.log("Watch window expired for resource/context", resource, context);
        if (event.target) {
          event.target.shouldRelist = true;
        }
        return;
      }
      else if (eventData.type === "DELETED") {
        // Add this ourselves since the API doesn't add anything
        // this way the views can use it to trigger special behaviors
        if (eventData.object && eventData.object.metadata && !eventData.object.metadata.deletionTimestamp) {
          eventData.object.metadata.deletionTimestamp = (new Date()).toISOString();
        }
      }

      if (eventData.object) {
        this._resourceVersion(key, eventData.object.resourceVersion || eventData.object.metadata.resourceVersion);
      }
      // TODO do we reset all the by() indices, or simply update them, since we should know what keys are there?
      // TODO let the data object handle its own update
      this._data(key).update(eventData.object, eventData.type);
      var self = this;
      // Wrap in a $timeout which will trigger an $apply to mirror $http callback behavior
      // without timeout this is triggering a repeated digest loop
      $timeout(function() {
        self._watchCallbacks(key).fire(self._data(key), eventData.type, eventData.object);
      }, 0, invokeApply);
    }
    catch (e) {
      // TODO: surface in the UI?
      Logger.error("Error processing message", resource, event.data);
    }
  };

  DataService.prototype._watchOpOnClose = function(resource, context, opts, event) {
    var eventWS = event.target;
    var key = this._uniqueKey(resource, null, context, opts);

    if (!eventWS) {
      Logger.log("Skipping reopen, no eventWS in event", event);
      return;
    }

    var registeredWS = this._watchWebsockets(key);
    if (!registeredWS) {
      Logger.log("Skipping reopen, no registeredWS for resource/context", resource, context);
      return;
    }

    // Don't reopen a web socket that is no longer registered for this resource/context
    if (eventWS !== registeredWS) {
      Logger.log("Skipping reopen, eventWS does not match registeredWS", eventWS, registeredWS);
      return;
    }

    // We are the registered web socket for this resource/context, and we are no longer in flight
    // Unlock this resource/context in case we decide not to reopen
    this._watchInFlight(key, false);

    // Don't reopen web sockets we closed ourselves
    if (eventWS.shouldClose) {
      Logger.log("Skipping reopen, eventWS was explicitly closed", eventWS);
      return;
    }

    // Don't reopen clean closes (for example, navigating away from the page to example.com)
    if (event.wasClean) {
      Logger.log("Skipping reopen, clean close", event);
      return;
    }

    // Don't reopen if no one is listening for this data any more
    if (!this._watchCallbacks(key).has()) {
      Logger.log("Skipping reopen, no listeners registered for resource/context", resource, context);
      return;
    }

    // Don't reopen if we've failed this resource/context too many times
    if (this._isTooManyWebsocketRetries(key)) {
      // Show an error notication unless disabled in opts.
      if (_.get(opts, 'errorNotification', true)) {
        // Use `$rootScope.$emit` instead of NotificationsService directly
        // so that DataService doesn't add a dependency on `openshiftCommonUI`
        $rootScope.$emit('NotificationsService.addNotification', {
          id: 'websocket_retry_halted',
          type: 'error',
          message: 'Server connection interrupted.',
          links: [{
            label: 'Refresh',
            onClick: function() {
              window.location.reload();
            }
          }]
        });
      }
      return;
    }

    // Keep track of this event.
    this._addWebsocketEvent(key, 'close');

    // If our watch window expired, we have to relist to get a new resource version to watch from
    if (eventWS.shouldRelist) {
      Logger.log("Relisting for resource/context", resource, context);
      // Restart a watch() from the beginning, which triggers a list/watch sequence
      // The watch() call is responsible for setting _watchInFlight back to true
      // Add a short delay to avoid a scenario where we make non-stop requests
      // When the timeout fires, if no callbacks are registered for this
      //   resource/context, or if a watch is already in flight, `watch()` is a no-op
      var self = this;
      setTimeout(function() {
        self.watch(resource, context);
      }, 2000);
      return;
    }

    // Attempt to re-establish the connection after a two-second back-off
    // Re-mark ourselves as in-flight to prevent other callers from jumping in in the meantime
    Logger.log("Rewatching for resource/context", resource, context);
    this._watchInFlight(key, true);
    setTimeout(
      $.proxy(this, "_startWatchOp", key, resource, context, opts, this._resourceVersion(key)),
      2000
    );
  };

  var URL_ROOT_TEMPLATE         = "{protocol}://{+hostPort}{+prefix}{/group}/{version}/";
  var URL_GET_LIST              = URL_ROOT_TEMPLATE + "{resource}{?q*}";
  var URL_OBJECT                = URL_ROOT_TEMPLATE + "{resource}/{name}{/subresource*}{?q*}";
  var URL_NAMESPACED_GET_LIST   = URL_ROOT_TEMPLATE + "namespaces/{namespace}/{resource}{?q*}";
  var URL_NAMESPACED_OBJECT     = URL_ROOT_TEMPLATE + "namespaces/{namespace}/{resource}/{name}{/subresource*}{?q*}";


  DataService.prototype._urlForResource = function(resource, name, context, isWebsocket, params) {
    var apiInfo = APIService.apiInfo(resource);
    if (!apiInfo) {
      Logger.error("_urlForResource called with unknown resource", resource, arguments);
      return null;
    }

    var serviceProtocol = apiInfo.protocol || window.location.protocol;
    var protocol;
    params = params || {};
    if (isWebsocket) {
      protocol = serviceProtocol === "http:" ? "ws" : "wss";
    }
    else {
      protocol = serviceProtocol === "http:" ? "http" : "https";
    }

    if (context && context.namespace && !params.namespace) {
      params.namespace = context.namespace;
    }

    if (apiInfo.namespaced && !params.namespace) {
      Logger.error("_urlForResource called for a namespaced resource but no namespace provided", resource, arguments);
      return null;
    }

    var namespaceInPath = apiInfo.namespaced;
    var namespace = null;
    if (namespaceInPath) {
      namespace = params.namespace;
      params = angular.copy(params);
      delete params.namespace;
    }
    var template;
    var templateOptions = {
      protocol: protocol,
      hostPort: apiInfo.hostPort,
      prefix: apiInfo.prefix,
      group: apiInfo.group,
      version: apiInfo.version,
      resource: resource.primaryResource(),
      subresource: resource.subresources(),
      name: name,
      namespace: namespace,
      q: params
    };
    if (name) {
      template = namespaceInPath ? URL_NAMESPACED_OBJECT : URL_OBJECT;
    }
    else {
      template = namespaceInPath ? URL_NAMESPACED_GET_LIST : URL_GET_LIST;
    }
    return URI.expand(template, templateOptions).toString();
  };

  DataService.prototype.url = function(options) {
    if (options && options.resource) {
      var opts = angular.copy(options);
      delete opts.resource;
      delete opts.group;
      delete opts.version;
      delete opts.name;
      delete opts.isWebsocket;
      var resource = APIService.toResourceGroupVersion({
        resource: options.resource,
        group:    options.group,
        version:  options.version
      });
      return this._urlForResource(resource, options.name, null, !!options.isWebsocket, opts);
    }
    return null;
  };

  DataService.prototype.openshiftAPIBaseUrl = function() {
    var protocol = window.location.protocol === "http:" ? "http" : "https";
    var hostPort = API_CFG.openshift.hostPort;
    return new URI({protocol: protocol, hostname: hostPort}).toString();
  };

  DataService.prototype._getAPIServerVersion = function(path) {
    var protocol = window.location.protocol === "http:" ? "http" : "https";
    var versionURL = new URI({
      protocol: protocol,
      hostname: API_CFG.k8s.hostPort,
      path: path
    }).toString();
    return $http.get(versionURL, {
      headers: {
        Accept: 'application/json'
      }
    });
  };

  DataService.prototype.getKubernetesMasterVersion = function() {
    return this._getAPIServerVersion('/version');
  };

  DataService.prototype.getOpenShiftMasterVersion = function() {
    return this._getAPIServerVersion('/version/openshift');
  };

  // Used by ProjectsService when a list fails.
  DataService.prototype.createData = function(array) {
    return new Data(array);
  };

  // Immutables are flagged here as we should not need to fetch them more than once.
  var IMMUTABLE_RESOURCE = {
    imagestreamimages: true
  };

  // - request once and never need to request again, these do not change!
  DataService.prototype._isImmutable = function(resource) {
    return !!IMMUTABLE_RESOURCE[resource.resource];
  };

  // do we already have the data for this?
  DataService.prototype._hasImmutable = function(resource, existingData, name) {
    return this._isImmutable(resource) && existingData && existingData.by('metadata.name')[name];
  };

  DataService.prototype._getNamespace = function(resource, context, opts) {
    var deferred = $q.defer();
    if (opts.namespace) {
      deferred.resolve({namespace: opts.namespace});
    }
    else if (context.projectPromise && !resource.equals("projects")) {
      context.projectPromise.done(function(project) {
        deferred.resolve({namespace: project.metadata.name});
      });
    }
    else {
      deferred.resolve(null);
    }
    return deferred.promise;
  };

  return new DataService();
});
;'use strict';

// Logout strategies
angular.module('openshiftCommonServices')
.provider('DeleteTokenLogoutService', function() {

  this.$get = function(
    $q,
    $injector,
    Logger) {
    var authLogger = Logger.get("auth");
    return {
      logout: function(user, token) {
        authLogger.log("DeleteTokenLogoutService.logout()", user, token);

        // If we don't have a token, we're done
        if (!token) {
          authLogger.log("DeleteTokenLogoutService, no token, returning immediately");
          return $q.when({});
        }

        // Lazy load services to eliminate circular dependencies.
        var APIService = $injector.get('APIService');
        var DataService = $injector.get('DataService');

        var oAuthAccessTokensVersion = APIService.getPreferredVersion('oauthaccesstokens');
        // Use the token to delete the token
        // Never trigger a login when deleting our token
        var opts = {http: {auth: {token: token, triggerLogin: false}}};
        // TODO: Change this to return a promise that "succeeds" even if the token delete fails?
        return DataService.delete(oAuthAccessTokensVersion, token, {}, opts);
      },
    };
  };
});
;'use strict';

angular.module("openshiftCommonServices")
  .service("KeywordService", function(){

    var generateKeywords = function(filterText) {
      if (!filterText) {
        return [];
      }

      var keywords = _.uniq(filterText.match(/\S+/g));

      // Sort the longest keyword first.
      keywords.sort(function(a, b){
        return b.length - a.length;
      });

      // Convert the keyword to a case-insensitive regular expression for the filter.
      return _.map(keywords, function(keyword) {
        return new RegExp(_.escapeRegExp(keyword), "i");
      });
    };

    var filterForKeywords = function(objects, filterFields, keywords) {
      var filteredObjects = objects;
      if (_.isEmpty(keywords)) {
        return filteredObjects;
      }

      // Find resources that match all keywords.
      angular.forEach(keywords, function(regex) {
        var matchesKeyword = function(obj) {
          var i;
          for (i = 0; i < filterFields.length; i++) {
            var value = _.get(obj, filterFields[i]);
            if (value && regex.test(value)) {
              return true;
            }
          }

          return false;
        };

        filteredObjects = _.filter(filteredObjects, matchesKeyword);
      });
      return filteredObjects;
    };

    return {
      filterForKeywords: filterForKeywords,
      generateKeywords: generateKeywords
    };
  });
;'use strict';

angular.module('openshiftCommonServices')
.provider('Logger', function() {
  this.$get = function() {
    // Wraps the global Logger from https://github.com/jonnyreeves/js-logger
    var OSLogger = Logger.get("OpenShift");
    var logger = {
      get: function(name) {
        var logger = Logger.get("OpenShift/" + name);
        var logLevel = "OFF";
        if (localStorage) {
          logLevel = localStorage['OpenShiftLogLevel.' + name] || logLevel;
        }
        logger.setLevel(Logger[logLevel]);
        return logger;
      },
      log: function() {
        OSLogger.log.apply(OSLogger, arguments);
      },
      info: function() {
        OSLogger.info.apply(OSLogger, arguments);
      },
      debug: function() {
        OSLogger.debug.apply(OSLogger, arguments);
      },
      warn: function() {
        OSLogger.warn.apply(OSLogger, arguments);
      },
      error: function() {
        OSLogger.error.apply(OSLogger, arguments);
      }
    };

    // Set default log level
    var logLevel = "ERROR";
    if (localStorage) {
      logLevel = localStorage['OpenShiftLogLevel.main'] || logLevel;
    }
    OSLogger.setLevel(Logger[logLevel]);
    return logger;
  };
});
;'use strict';
/* jshint unused: false */

// UserStore objects able to remember user and tokens for the current user
angular.module('openshiftCommonServices')
.provider('MemoryUserStore', function() {
  this.$get = function(Logger){
    var authLogger = Logger.get("auth");
    var _user = null;
    var _token = null;
    return {
      available: function() {
        return true;
      },
      getUser: function(){
        authLogger.log("MemoryUserStore.getUser", _user);
        return _user;
      },
      setUser: function(user, ttl) {
        // TODO: honor ttl
        authLogger.log("MemoryUserStore.setUser", user);
        _user = user;
      },
      getToken: function() {
        authLogger.log("MemoryUserStore.getToken", _token);
        return _token;
      },
      setToken: function(token, ttl) {
        // TODO: honor ttl
        authLogger.log("MemoryUserStore.setToken", token);
        _token = token;
      }
    };
  };
})
.provider('SessionStorageUserStore', function() {
  this.$get = function(Logger){
    var authLogger = Logger.get("auth");
    var userkey = "SessionStorageUserStore.user";
    var tokenkey = "SessionStorageUserStore.token";
    return {
      available: function() {
        try {
          var x = String(new Date().getTime());
          sessionStorage['SessionStorageUserStore.test'] = x;
          var y = sessionStorage['SessionStorageUserStore.test'];
          sessionStorage.removeItem('SessionStorageUserStore.test');
          return x === y;
        } catch(e) {
          return false;
        }
      },
      getUser: function(){
        try {
          var user = JSON.parse(sessionStorage[userkey]);
          authLogger.log("SessionStorageUserStore.getUser", user);
          return user;
        } catch(e) {
          authLogger.error("SessionStorageUserStore.getUser", e);
          return null;
        }
      },
      setUser: function(user, ttl) {
        // TODO: honor ttl
        if (user) {
          authLogger.log("SessionStorageUserStore.setUser", user);
          sessionStorage[userkey] = JSON.stringify(user);
        } else {
          authLogger.log("SessionStorageUserStore.setUser", user, "deleting");
          sessionStorage.removeItem(userkey);
        }
      },
      getToken: function() {
        try {
          var token = sessionStorage[tokenkey];
          authLogger.log("SessionStorageUserStore.getToken", token);
          return token;
        } catch(e) {
          authLogger.error("SessionStorageUserStore.getToken", e);
          return null;
        }
      },
      setToken: function(token, ttl) {
        // TODO: honor ttl
        if (token) {
          authLogger.log("SessionStorageUserStore.setToken", token);
          sessionStorage[tokenkey] = token;
        } else {
          authLogger.log("SessionStorageUserStore.setToken", token, "deleting");
          sessionStorage.removeItem(tokenkey);
        }
      }
    };
  };
})
.provider('LocalStorageUserStore', function() {
  this.$get = function(Logger){
    var authLogger = Logger.get("auth");
    var userkey = "LocalStorageUserStore.user";
    var tokenkey = "LocalStorageUserStore.token";

    var ttlKey = function(key) {
      return key + ".ttl";
    };
    var setTTL = function(key, ttl) {
      if (ttl) {
        var expires = new Date().getTime() + ttl*1000;
        localStorage[ttlKey(key)] = expires;
        authLogger.log("LocalStorageUserStore.setTTL", key, ttl, new Date(expires).toString());
      } else {
        localStorage.removeItem(ttlKey(key));
        authLogger.log("LocalStorageUserStore.setTTL deleting", key);
      }
    };
    var isTTLExpired = function(key) {
      var ttl = localStorage[ttlKey(key)];
      if (!ttl) {
        return false;
      }
      var expired = parseInt(ttl) < new Date().getTime();
      authLogger.log("LocalStorageUserStore.isTTLExpired", key, expired);
      return expired;
    };

    return {
      available: function() {
        try {
          var x = String(new Date().getTime());
          localStorage['LocalStorageUserStore.test'] = x;
          var y = localStorage['LocalStorageUserStore.test'];
          localStorage.removeItem('LocalStorageUserStore.test');
          return x === y;
        } catch(e) {
          return false;
        }
      },
      getUser: function(){
        try {
          if (isTTLExpired(userkey)) {
            authLogger.log("LocalStorageUserStore.getUser expired");
            localStorage.removeItem(userkey);
            setTTL(userkey, null);
            return null;
          }
          var user = JSON.parse(localStorage[userkey]);
          authLogger.log("LocalStorageUserStore.getUser", user);
          return user;
        } catch(e) {
          authLogger.error("LocalStorageUserStore.getUser", e);
          return null;
        }
      },
      setUser: function(user, ttl) {
        if (user) {
          authLogger.log("LocalStorageUserStore.setUser", user, ttl);
          localStorage[userkey] = JSON.stringify(user);
          setTTL(userkey, ttl);
        } else {
          authLogger.log("LocalStorageUserStore.setUser", user, "deleting");
          localStorage.removeItem(userkey);
          setTTL(userkey, null);
        }
      },
      getToken: function() {
        try {
          if (isTTLExpired(tokenkey)) {
            authLogger.log("LocalStorageUserStore.getToken expired");
            localStorage.removeItem(tokenkey);
            setTTL(tokenkey, null);
            return null;
          }
          var token = localStorage[tokenkey];
          authLogger.log("LocalStorageUserStore.getToken", token);
          return token;
        } catch(e) {
          authLogger.error("LocalStorageUserStore.getToken", e);
          return null;
        }
      },
      setToken: function(token, ttl) {
        if (token) {
          authLogger.log("LocalStorageUserStore.setToken", token, ttl);
          localStorage[tokenkey] = token;
          setTTL(tokenkey, ttl);
        } else {
          authLogger.log("LocalStorageUserStore.setToken", token, ttl, "deleting");
          localStorage.removeItem(tokenkey);
          setTTL(tokenkey, null);
        }
      }
    };
  };
});
;'use strict';

angular.module('openshiftCommonServices')
  .factory('ProjectsService',
           function($location,
                    $q,
                    $rootScope,
                    APIService,
                    AuthService,
                    AuthorizationService,
                    DataService,
                    Logger,
                    RecentlyViewedProjectsService,
                    annotationNameFilter) {

      // Cache project data when we can so we don't request it on every page load.
      var cachedProjectData;
      var cachedProjectDataIncomplete = false;
      var projectsVersion = APIService.getPreferredVersion('projects');
      var projectRequestsVersion = APIService.getPreferredVersion('projectrequests');

      var clearCachedProjectData = function() {
        Logger.debug('ProjectsService: clearing project cache');
        cachedProjectData = null;
        cachedProjectDataIncomplete = false;
      };

      AuthService.onUserChanged(clearCachedProjectData);
      AuthService.onLogout(clearCachedProjectData);

      var cleanEditableAnnotations = function(resource) {
        var paths = [
              annotationNameFilter('description'),
              annotationNameFilter('displayName')
            ];
        _.each(paths, function(path) {
          if(!resource.metadata.annotations[path]) {
            delete resource.metadata.annotations[path];
          }
        });
        return resource;
      };

      return {
        get: function(projectName, opts) {
          return  AuthService
                    .withUser()
                    .then(function() {
                      var context = {
                        // TODO: swap $.Deferred() for $q.defer()
                        projectPromise: $.Deferred(),
                        projectName: projectName,
                        project: undefined
                      };
                      return DataService
                              .get(projectsVersion, projectName, context, {errorNotification: false})
                              .then(function(project) {
                                return AuthorizationService
                                        .getProjectRules(projectName)
                                        .then(function() {
                                          context.project = project;
                                          context.projectPromise.resolve(project);
                                          RecentlyViewedProjectsService.addProjectUID(project.metadata.uid);
                                          if (cachedProjectData) {
                                            cachedProjectData.update(project, 'MODIFIED');
                                          }

                                          // TODO: fix need to return context & projectPromise
                                          return [project, context];
                                        });
                              }, function(e) {
                                context.projectPromise.reject(e);
                                if ((e.status === 403 || e.status === 404) && _.get(opts, 'skipErrorNotFound')) {
                                  return $q.reject({notFound: true});
                                }
                                var description = 'The project could not be loaded.';
                                var type = 'error';
                                if(e.status === 403) {
                                  description = 'The project ' + context.projectName + ' does not exist or you are not authorized to view it.';
                                  type = 'access_denied';
                                } else if (e.status === 404) {
                                  description = 'The project ' + context.projectName + ' does not exist.';
                                  type = 'not_found';
                                }
                                $location
                                  .url(
                                    URI('error')
                                      .query({
                                        "error" : type,
                                        "error_description": description
                                      })
                                      .toString());
                                return $q.reject();
                              });
                    });
          },

          // List the projects the user has access to. This method returns
          // cached data if the projects had previously been fetched to avoid
          // requesting them again and again, which is a problem for admins who
          // might have hundreds or more.
          list: function(forceRefresh) {
            if (cachedProjectData && !forceRefresh) {
              Logger.debug('ProjectsService: returning cached project data');
              return $q.when(cachedProjectData);
            }

            Logger.debug('ProjectsService: listing projects, force refresh', forceRefresh);
            return DataService.list(projectsVersion, {}).then(function(projectData) {
              cachedProjectData = projectData;
              return projectData;
            }, function(error) {
              // If the request fails, don't try to list projects again without `forceRefresh`.
              cachedProjectData = DataService.createData([]);
              cachedProjectDataIncomplete = true;
              return $q.reject();
            });
          },

          isProjectListIncomplete: function() {
            return cachedProjectDataIncomplete;
          },

          watch: function(context, callback) {
            // Wrap `DataService.watch` so we can update the cached projects
            // list on changes. TODO: We might want to disable watches entirely
            // if we know the project list is large.
            return DataService.watch(projectsVersion, context, function(projectData) {
              cachedProjectData = projectData;
              callback(projectData);
            });
          },

          update: function(projectName, data) {
            return DataService.update(projectsVersion, projectName, cleanEditableAnnotations(data), {
              projectName: projectName
            }, {
              errorNotification: false
            }).then(function(updatedProject) {
              if (cachedProjectData) {
                cachedProjectData.update(updatedProject, 'MODIFIED');
              }

              return updatedProject;
            });
          },

          create: function(name, displayName, description) {
            var projectRequest = {
              apiVersion: APIService.toAPIVersion(projectRequestsVersion),
              kind: "ProjectRequest",
              metadata: {
                name: name
              },
              displayName: displayName,
              description: description
            };

            return DataService
              .create(projectRequestsVersion, null, projectRequest, {})
              .then(function(project) {
                RecentlyViewedProjectsService.addProjectUID(project.metadata.uid);
                if (cachedProjectData) {
                  cachedProjectData.update(project, 'ADDED');
                }
                return project;
              });
          },

          canCreate: function() {
            return DataService.get(projectRequestsVersion, null, {}, { errorNotification: false});
          },

          delete: function(project) {
            return DataService.delete(projectsVersion, project.metadata.name, {}).then(function(deletedProject) {
              if (cachedProjectData) {
                cachedProjectData.update(project, 'DELETED');
              }

              return deletedProject;
            });
          }
        };
    });
;'use strict';

angular.module('openshiftCommonServices')
  .factory('PromiseUtils', function($q) {
    return {
      // Returns a promise that is resolved or rejected only after all promises
      // complete. `promises` is a collection of promises. `null` or
      // `undefined` values are treated as "complete."
      //
      // Different than `$q.all` in that it will always wait for all promises.
      // `$q.all` short circuits as soon as one fails.
      //
      // Also unlike `$q.all`, this method does not return any values when
      // resolving or reasons when rejecting the promise.
      waitForAll: function(promises) {
        var total = _.size(promises);
        if (!total) {
          return $q.when();
        }

        var deferred = $q.defer();
        var complete = 0;
        var failed = false;
        var checkDone = function() {
          if (complete < total) {
            return;
          }

          if (failed) {
            deferred.reject();
          } else {
            deferred.resolve();
          }
        };

        _.each(promises, function(promise) {
          if (!promise) {
            complete++;
            checkDone();
            return;
          }

          promise.catch(function() {
            failed = true;
          }).finally(function() {
            complete++;
            checkDone();
          });
        });

        return deferred.promise;
      }
    };
  });
;'use strict';

angular.module("openshiftCommonServices")
  .service("RecentlyViewedProjectsService", function($filter){

    var recentlyViewedProjsKey = "openshift/recently-viewed-project-uids";

    var getProjectUIDs = function() {
      var recentlyViewed = localStorage.getItem(recentlyViewedProjsKey);
      return recentlyViewed ? JSON.parse(recentlyViewed) : [];
    };

    var addProjectUID = function(uid) {
      var recentlyViewed = getProjectUIDs();

      // add to front of list
      recentlyViewed.unshift(uid);

      // no dups
      recentlyViewed = _.uniq(recentlyViewed);

      // limit to 5 items
      recentlyViewed = _.take(recentlyViewed, 5);

      setRecentlyViewedProjects(recentlyViewed);
    };

    var clear = function() {
      localStorage.removeItem(recentlyViewedProjsKey);
    };

    var setRecentlyViewedProjects = function(recentlyViewed) {
      localStorage.setItem(recentlyViewedProjsKey, JSON.stringify(recentlyViewed));
    };

    var orderByMostRecentlyViewed = function(projects) {
      var recentlyViewedProjects = [];
      var recentlyViewedIds = getProjectUIDs();

      // remove mostRecentlyViewed projects
      _.each(recentlyViewedIds, function(uid) {
        var proj = _.remove(projects, function(project) {
          return project.metadata.uid === uid;
        })[0];
        if(proj !== undefined) {
          recentlyViewedProjects.push(proj);
        }
      });

      // second sort by case insensitive displayName
      projects = _.sortBy(projects, function(project) {
        return $filter('displayName')(project).toLowerCase();
      });

      return recentlyViewedProjects.concat(projects);
    };

    var isRecentlyViewed = function(uid) {
      return _.includes(getProjectUIDs(), uid);
    };

    return {
      getProjectUIDs: getProjectUIDs,
      addProjectUID: addProjectUID,
      orderByMostRecentlyViewed: orderByMostRecentlyViewed,
      clear: clear,
      isRecentlyViewed: isRecentlyViewed
    };
  });
;'use strict';

// Login strategies
angular.module('openshiftCommonServices')
.provider('RedirectLoginService', function() {
  var _oauth_client_id = "";
  var _oauth_authorize_uri = "";
  var _oauth_token_uri = "";
  var _oauth_redirect_uri = "";
  var _oauth_scope = "";

  this.OAuthClientID = function(id) {
    if (id) {
      _oauth_client_id = id;
    }
    return _oauth_client_id;
  };
  this.OAuthAuthorizeURI = function(uri) {
    if (uri) {
      _oauth_authorize_uri = uri;
    }
    return _oauth_authorize_uri;
  };
  this.OAuthTokenURI = function(uri) {
    if (uri) {
      _oauth_token_uri = uri;
    }
    return _oauth_token_uri;
  };
  this.OAuthRedirectURI = function(uri) {
    if (uri) {
      _oauth_redirect_uri = uri;
    }
    return _oauth_redirect_uri;
  };
  this.OAuthScope = function(scope) {
    if (scope) {
      _oauth_scope = scope;
    }
    return _oauth_scope;
  }

  this.$get = function($injector, $location, $q, Logger, base64) {
    var authLogger = Logger.get("auth");

    var getRandomInts = function(length) {
      var randomValues;

      if (window.crypto && window.Uint32Array) {
        try {
          var r = new Uint32Array(length);
          window.crypto.getRandomValues(r);
          randomValues = [];
          for (var j=0; j < length; j++) {
            randomValues.push(r[j]);
          }
        } catch(e) {
          authLogger.debug("RedirectLoginService.getRandomInts: ", e);
          randomValues = null;
        }
      }

      if (!randomValues) {
        randomValues = [];
        for (var i=0; i < length; i++) {
          randomValues.push(Math.floor(Math.random() * 4294967296));
        }
      }

      return randomValues;
    };

    var nonceKey = "RedirectLoginService.nonce";
    var makeState = function(then) {
      var nonce = String(new Date().getTime()) + "-" + getRandomInts(8).join("");
      try {
        if (window.localStorage[nonceKey] && window.localStorage[nonceKey].length > 10) {
          // Reuse an existing nonce if we have one, so that when multiple tabs get kicked to a login screen,
          // any of them can succeed, not just the last login flow that was started. The nonce gets cleared when the login flow completes.
          nonce = window.localStorage[nonceKey];
        } else {
          // Otherwise store the new nonce for comparison in parseState()
          window.localStorage[nonceKey] = nonce;
        }
      } catch(e) {
        authLogger.log("RedirectLoginService.makeState, localStorage error: ", e);
      }
      return base64.urlencode(JSON.stringify({then: then, nonce:nonce}));
    };
    var parseState = function(state) {
      var retval = {
        then: null,
        verified: false
      };

      var nonce = "";
      try {
        nonce = window.localStorage[nonceKey];
        window.localStorage.removeItem(nonceKey);
      } catch(e) {
        authLogger.log("RedirectLoginService.parseState, localStorage error: ", e);
      }

      try {
        var data = state ? JSON.parse(base64.urldecode(state)) : {};
        if (data && data.nonce && nonce && data.nonce === nonce) {
          retval.verified = true;
          retval.then = data.then;
        }
      } catch(e) {
        authLogger.error("RedirectLoginService.parseState, state error: ", e);
      }
      authLogger.error("RedirectLoginService.parseState", retval);
      return retval;
    };

    return {
      // Returns a promise that resolves with {user:{...}, token:'...', ttl:X}, or rejects with {error:'...'[,error_description:'...',error_uri:'...']}
      login: function() {
        if (_oauth_client_id === "") {
          return $q.reject({error:'invalid_request', error_description:'RedirectLoginServiceProvider.OAuthClientID() not set'});
        }
        if (_oauth_authorize_uri === "") {
          return $q.reject({error:'invalid_request', error_description:'RedirectLoginServiceProvider.OAuthAuthorizeURI() not set'});
        }
        if (_oauth_redirect_uri === "") {
          return $q.reject({error:'invalid_request', error_description:'RedirectLoginServiceProvider.OAuthRedirectURI not set'});
        }

        // Never send a local fragment to remote servers
        var returnUri = new URI($location.url()).fragment("");
        var authorizeParams = {
          client_id: _oauth_client_id,
          response_type: 'token',
          state: makeState(returnUri.toString()),
          redirect_uri: _oauth_redirect_uri
        };

        if (_oauth_scope) {
          authorizeParams.scope = _oauth_scope;
        }

        if (_oauth_token_uri) {
          authorizeParams.response_type = "code";
          // TODO: add PKCE
        }

        var deferred = $q.defer();
        var uri = new URI(_oauth_authorize_uri);
        uri.query(authorizeParams);
        authLogger.log("RedirectLoginService.login(), redirecting", uri.toString());
        window.location.href = uri.toString();
        // Return a promise we never intend to keep, because we're redirecting to another page
        return deferred.promise;
      },

      // Parses oauth callback parameters from window.location
      // Returns a promise that resolves with {token:'...',then:'...',verified:true|false}, or rejects with {error:'...'[,error_description:'...',error_uri:'...']}
      // If no token and no error is present, resolves with {}
      // Example error codes: https://tools.ietf.org/html/rfc6749#section-5.2
      finish: function() {
        // Obtain the $http service.
        // Can't declare the dependency directly because it causes a cycle between $http->AuthInjector->AuthService->RedirectLoginService
        var http = $injector.get("$http");

        // handleParams handles error or access_token responses
        var handleParams = function(params, stateData) {
          // Handle an error response from the OAuth server
          if (params.error) {
            authLogger.log("RedirectLoginService.finish(), error", params.error, params.error_description, params.error_uri);
            return $q.reject({
              error: params.error,
              error_description: params.error_description,
              error_uri: params.error_uri
            });
          }

          // Handle an access_token fragment response
          if (params.access_token) {
            return $q.when({
              token: params.access_token,
              ttl: params.expires_in,
              then: stateData.then,
              verified: stateData.verified
            });
          }

          // No token and no error is invalid
          return $q.reject({
            error: "invalid_request",
            error_description: "No API token returned"
          });
        };

        // Get url
        var u = new URI($location.url());

        // Read params
        var queryParams = u.query(true);
        var fragmentParams = new URI("?" + u.fragment()).query(true);
        authLogger.log("RedirectLoginService.finish()", queryParams, fragmentParams);

        // immediate error
        if (queryParams.error) {
          return handleParams(queryParams, parseState(queryParams.state));
        }
        // implicit error
        if (fragmentParams.error) {
          return handleParams(fragmentParams, parseState(fragmentParams.state));
        }
        // implicit success
        if (fragmentParams.access_token) {
          return handleParams(fragmentParams, parseState(fragmentParams.state));
        }
        // code flow
        if (_oauth_token_uri && queryParams.code) {
          // verify before attempting to exchange code for token
          // hard-fail state verification errors for code exchange
          var stateData = parseState(queryParams.state);
          if (!stateData.verified) {
            return $q.reject({
              error: "invalid_request",
              error_description: "Client state could not be verified"
            });
          }

          var tokenPostData = [
            "grant_type=authorization_code",
            "code="         + encodeURIComponent(queryParams.code),
            "redirect_uri=" + encodeURIComponent(_oauth_redirect_uri),
            "client_id="    + encodeURIComponent(_oauth_client_id)
          ].join("&");

          if (_oauth_scope) {
            tokenPostData += "&scope=" + encodeURIComponent(_oauth_scope);
          }

          return http({
            method: "POST",
            url: _oauth_token_uri,
            headers: {
              "Authorization": "Basic " + window.btoa(_oauth_client_id+":"),
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: tokenPostData
          }).then(function(response){
            return handleParams(response.data, stateData);
          }, function(response) {
            authLogger.log("RedirectLoginService.finish(), error getting access token", response);
            return handleParams(response.data, stateData);
          });
        }

        // No token and no error is invalid
        return $q.reject({
          error: "invalid_request",
          error_description: "No API token returned"
        });
      }
    };
  };
});
;'use strict';

angular.module("openshiftCommonServices")
  .service("VersionsService", function(){
    var compareInteral = function(v1, v2, newestFirst) {
      v1 = v1 || '';
      v2 = v2 || '';
      try {
        // compareVersions will sort via semver and throw an error if one of
        // the values is not a version string.
        var result = window.compareVersions(v1, v2);
        return newestFirst ? result * -1 : result;
      } catch (e) {
        // One of the values is not a version string. Fall back to string comparison.
        // Numbers will be sorted higher by localeCompare.
        return v1.localeCompare(v2);
      }
    };

    return {
      // Order oldest version first.
      compare: function(v1, v2) {
        return compareInteral(v1, v2, false);
      },
      // Order newest version first.
      rcompare: function(v1, v2) {
        return compareInteral(v1, v2, true);
      },
    };
  });
;'use strict';

// Provide a websocket implementation that behaves like $http
// Methods:
//   $ws({
//     url: "...", // required
//     method: "...", // defaults to WATCH
//   })
//   returns a promise to the opened WebSocket
//
//   $ws.available()
//   returns true if WebSockets are available to use
angular.module('openshiftCommonServices')
.provider('$ws', function($httpProvider) {

  // $get method is called to build the $ws service
  this.$get = function($q, $injector, Logger) {
    var authLogger = Logger.get("auth");
    authLogger.log("$wsProvider.$get", arguments);

    // Build list of interceptors from $httpProvider when constructing the $ws service
    // Build in reverse-order, so the last interceptor added gets to handle the request first
    var _interceptors = [];
    angular.forEach($httpProvider.interceptors, function(interceptorFactory) {
      if (angular.isString(interceptorFactory)) {
      	_interceptors.unshift($injector.get(interceptorFactory));
      } else {
      	_interceptors.unshift($injector.invoke(interceptorFactory));
      }
    });

    // Implement $ws()
    var $ws = function(config) {
      config.method = angular.uppercase(config.method || "WATCH");

      authLogger.log("$ws (pre-intercept)", config.url.toString());
      var serverRequest = function(config) {
        authLogger.log("$ws (post-intercept)", config.url.toString());
        var ws = new WebSocket(config.url, config.protocols);
        if (config.onclose)   { ws.onclose   = config.onclose;   }
        if (config.onmessage) { ws.onmessage = config.onmessage; }
        if (config.onopen)    { ws.onopen    = config.onopen;    }
        if (config.onerror)   { ws.onerror    = config.onerror;  }
        return ws;
      };

      // Apply interceptors to request config
      var chain = [serverRequest, undefined];
      var promise = $q.when(config);
      angular.forEach(_interceptors, function(interceptor) {
        if (interceptor.request || interceptor.requestError) {
          chain.unshift(interceptor.request, interceptor.requestError);
        }
        // TODO: figure out how to get interceptors to handle response errors from web sockets
        // if (interceptor.response || interceptor.responseError) {
        //   chain.push(interceptor.response, interceptor.responseError);
        // }
      });
      while (chain.length) {
        var thenFn = chain.shift();
        var rejectFn = chain.shift();
        promise = promise.then(thenFn, rejectFn);
      }
      return promise;
    };

    // Implement $ws.available()
    $ws.available = function() {
      try {
        return !!WebSocket;
      }
      catch(e) {
        return false;
      }
    };

    return $ws;
  };
});
;'use strict';

angular.module('openshiftCommonServices')
  .constant('API_DEDUPLICATION', {
    // Exclude duplicate kinds we know about that map to the same storage as another
    //  group/kind.  This is unusual, so we are special casing these.
    groups: [{group: 'authorization.openshift.io'}],
    kinds: [
      {group: 'extensions', kind: 'HorizontalPodAutoscaler'},
      {group: 'extensions', kind: 'DaemonSet'}
    ]
  });
;'use strict';

angular.module('openshiftCommonServices')
  .constant('API_PREFERRED_VERSIONS', {
      appliedclusterresourcequotas:     {group: 'quota.openshift.io',         version: 'v1',      resource: 'appliedclusterresourcequotas' },
      builds:                           {group: 'build.openshift.io',         version: 'v1',      resource: 'builds' },
      'builds/clone':                   {group: 'build.openshift.io',         version: 'v1',      resource: 'builds/clone' },
      'builds/log':                     {group: 'build.openshift.io',         version: 'v1',      resource: 'builds/log' },
      'buildconfigs/instantiate':       {group: 'build.openshift.io',         version: 'v1',      resource: 'buildconfigs/instantiate' },
      buildconfigs:                     {group: 'build.openshift.io',         version: 'v1',      resource: 'buildconfigs' },
      configmaps:                       {version: 'v1',                       resource: 'configmaps' },
      clusterroles:                     {group: 'rbac.authorization.k8s.io',  version: 'v1',      resource: 'clusterroles' },
      clusterserviceclasses:            {group: 'servicecatalog.k8s.io',      version: 'v1beta1', resource: 'clusterserviceclasses' },
      clusterserviceplans:              {group: 'servicecatalog.k8s.io',      version: 'v1beta1', resource: 'clusterserviceplans' },
      deployments:                      {group: 'apps',                       version: 'v1beta1', resource: 'deployments' },
      deploymentconfigs:                {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs' },
      'deploymentconfigs/instantiate':  {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs/instantiate' },
      'deploymentconfigs/rollback':     {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs/rollback' },
      'deploymentconfigs/log':          {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs/log' },
      endpoints:                        {version: 'v1',                       resource: 'endpoints'},
      events:                           {version: 'v1',                       resource: 'events' },
      horizontalpodautoscalers:         {group: 'autoscaling',                version: 'v1',      resource: 'horizontalpodautoscalers' },
      imagestreams:                     {group: 'image.openshift.io',         version: 'v1',      resource: 'imagestreams' },
      imagestreamtags:                  {group: 'image.openshift.io',         version: 'v1',      resource: 'imagestreamtags' },
      imagestreamimages:                {group: 'image.openshift.io',         version: 'v1',      resource: 'imagestreamimages' },
      imagestreamimports:               {group: 'image.openshift.io',         version: 'v1',      resource: 'imagestreamimports' },
      limitranges:                      {version: 'v1',                       resource: 'limitranges' },
      oauthaccesstokens:                {group: 'oauth.openshift.io',         version: 'v1',      resource: 'oauthaccesstokens' },
      pods:                             {version: 'v1',                       resource: 'pods' },
      'pods/log':                       {version: 'v1',                       resource: 'pods/log' },
      processedtemplates:               {group: 'template.openshift.io',      version: 'v1',      resource: 'processedtemplates' },
      projects:                         {group: 'project.openshift.io',       version: 'v1',      resource: 'projects' },
      projectrequests:                  {group: 'project.openshift.io',       version: 'v1',      resource: 'projectrequests' },
      persistentvolumeclaims:           {version: 'v1',                       resource: 'persistentvolumeclaims' },
      replicasets:                      {group: 'apps',                       version: 'v1',      resource: 'replicasets' },
      replicationcontrollers:           {version: 'v1',                       resource: 'replicationcontrollers' },
      resourcequotas:                   {version: 'v1',                       resource: 'resourcequotas' },
      rolebindings:                     {group: 'rbac.authorization.k8s.io',  version: 'v1',      resource: 'rolebindings' },
      roles:                            {group: 'rbac.authorization.k8s.io',  version: 'v1',      resource: 'roles' },
      routes:                           {group: 'route.openshift.io',         version: 'v1',      resource: 'routes' },
      secrets:                          {version: 'v1',                       resource: 'secrets' },
      selfsubjectrulesreviews:          {group: 'authorization.openshift.io', version: 'v1',      resource: 'selfsubjectrulesreviews' },
      services:                         {version: 'v1',                       resource: 'services' },
      serviceaccounts:                  {version: 'v1',                       resource: 'serviceaccounts' },
      servicebindings:                  {group: 'servicecatalog.k8s.io',      version: 'v1beta1', resource: 'servicebindings' },
      serviceinstances:                 {group: 'servicecatalog.k8s.io',      version: 'v1beta1', resource: 'serviceinstances' },
      statefulsets:                     {group: 'apps',                       version: 'v1beta1', resource: 'statefulsets' },
      storageclasses:                   {group: 'storage.k8s.io',             version: 'v1',      resource: 'storageclasses'},
      templates:                        {group: 'template.openshift.io',      verison: 'v1',      resource: 'templates' },
      users:                            {group: 'user.openshift.io',          version: 'v1',      resource: 'users' }
  });
