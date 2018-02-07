'use strict';

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
