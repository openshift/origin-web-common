'use strict';
/* jshint unused: false */

angular.module('openshiftCommonUI')
  // this filter is intended for use with the "track by" in an ng-repeat
  // when uid is not defined it falls back to object identity for uniqueness
  .filter('uid', function() {
    return function(resource) {
      if (resource && resource.metadata && resource.metadata.uid) {
        return resource.metadata.uid;
      }
      else {
        return resource;
      }
    };
  })
  .filter('labelName', function() {
    var labelMap = {
      'buildConfig' : ["openshift.io/build-config.name"],
      'deploymentConfig' : ["openshift.io/deployment-config.name"]
    };
    return function(labelKey) {
      return labelMap[labelKey];
    };
  })
  .filter('description', function(annotationFilter) {
    return function(resource) {
      // Prefer `openshift.io/description`, but fall back to `kubernetes.io/description`.
      // Templates use simply `description` without a namespace.
      return annotationFilter(resource, 'openshift.io/description') ||
             annotationFilter(resource, 'kubernetes.io/description') ||
             annotationFilter(resource, 'description');
    };
  })
  .filter('displayName', function(annotationFilter) {
    // annotationOnly - if true, don't fall back to using metadata.name when
    //                  there's no displayName annotation
    return function(resource, annotationOnly) {
      var displayName = annotationFilter(resource, "displayName");
      if (displayName || annotationOnly) {
        return displayName;
      }

      if (resource && resource.metadata) {
        return resource.metadata.name;
      }

      return null;
    };
  })
  .filter('uniqueDisplayName', function(displayNameFilter){
    function countNames(projects){
      var nameCount = {};
      angular.forEach(projects, function(project, key){
        var displayName = displayNameFilter(project);
        nameCount[displayName] = (nameCount[displayName] || 0) + 1;
      });
      return nameCount;
    }
    return function (resource, projects){
      if (!resource) {
        return '';
      }
      var displayName = displayNameFilter(resource);
      var name = resource.metadata.name;
      if (displayName !== name && countNames(projects)[displayName] > 1 ){
        return displayName + ' (' + name + ')';
      }
      return displayName;
    };
  })
  .filter('searchProjects', function(displayNameFilter) {
    return function(projects, text) {
      if (!text) {
        return projects;
      }

      // Lowercase the search string and project display name to perform a case-insensitive search.
      text = text.toLowerCase();
      return _.filter(projects, function(project) {
        if (_.includes(project.metadata.name, text)) {
          return true;
        }

        var displayName = displayNameFilter(project, true);
        if (displayName && _.includes(displayName.toLowerCase(), text)) {
          return true;
        }

        return false;
      });
    };
  })
  .filter('label', function() {
    return function(resource, key) {
      if (resource && resource.metadata && resource.metadata.labels) {
        return resource.metadata.labels[key];
      }
      return null;
    };
  })
  .filter('humanizeKind', function (startCaseFilter) {
    // Changes "ReplicationController" to "replication controller".
    // If useTitleCase, returns "Replication Controller".
    return function(kind, useTitleCase) {
      if (!kind) {
        return kind;
      }

      var humanized = _.startCase(kind);
      if (useTitleCase) {
        return humanized;
      }

      return humanized.toLowerCase();
    };
  })
  // gets the status condition that matches provided type
  // statusCondition(object, 'Ready')
  .filter('statusCondition', function() {
    return function(apiObject, type) {
      if (!apiObject) {
        return null;
      }

      return _.find(_.get(apiObject, 'status.conditions'), {type: type});
    };
  })
  .filter('isServiceInstanceReady', function(statusConditionFilter) {
    return function(apiObject) {
      return _.get(statusConditionFilter(apiObject, 'Ready'), 'status') === 'True';
    };
  })
  .filter('isBindingReady', function(isServiceInstanceReadyFilter) {
    return isServiceInstanceReadyFilter;
  })
  .filter('hasDeployment', function(annotationFilter) {
    return function(object) {
      return !!annotationFilter(object, 'deployment.kubernetes.io/revision');
    };
  })
  .filter('hasDeploymentConfig', function(annotationFilter) {
    return function(deployment) {
      return !!annotationFilter(deployment, 'deploymentConfig');
    };
  })
;
