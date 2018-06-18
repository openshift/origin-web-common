'use strict';
/* jshint unused: false */

angular.module('openshiftCommonUI')
  .filter('annotationName', function() {
    // This maps an annotation key to all known synonymous keys to insulate
    // the referring code from key renames across API versions.
    var annotationMap = {
      "buildConfig":              ["openshift.io/build-config.name"],
      "deploymentConfig":         ["openshift.io/deployment-config.name"],
      "deployment":               ["openshift.io/deployment.name"],
      "pod":                      ["openshift.io/deployer-pod.name"],
      "deployerPod":              ["openshift.io/deployer-pod.name"],
      "deployerPodFor":           ["openshift.io/deployer-pod-for.name"],
      "deploymentStatus":         ["openshift.io/deployment.phase"],
      "deploymentStatusReason":   ["openshift.io/deployment.status-reason"],
      "deploymentCancelled":      ["openshift.io/deployment.cancelled"],
      "encodedDeploymentConfig":  ["openshift.io/encoded-deployment-config"],
      "deploymentVersion":        ["openshift.io/deployment-config.latest-version"],
      "displayName":              ["openshift.io/display-name"],
      "description":              ["openshift.io/description"],
      "buildNumber":              ["openshift.io/build.number"],
      "buildPod":                 ["openshift.io/build.pod-name"],
      "jenkinsBuildURL":          ["openshift.io/jenkins-build-uri"],
      "jenkinsLogURL":            ["openshift.io/jenkins-log-url"],
      "jenkinsStatus":            ["openshift.io/jenkins-status-json"],
      "loggingUIHostname":        ["openshift.io/logging.ui.hostname"],
      "loggingDataPrefix":        ["openshift.io/logging.data.prefix"],
      "idledAt":                  ["idling.alpha.openshift.io/idled-at"],
      "idledPreviousScale":       ["idling.alpha.openshift.io/previous-scale"],
      "systemOnly":               ["authorization.openshift.io/system-only"],
      "mobileSetBuildDownload":   ["aerogear.org/download-mobile-artifact"],
      "mobileGetBuildDownload":   ["aerogear.org/download-mobile-artifact-url"]
    };
    return function(annotationKey) {
      return annotationMap[annotationKey] || null;
    };
  })
  .filter('annotation', function(annotationNameFilter) {
    return function(resource, key) {
      if (resource && resource.metadata && resource.metadata.annotations) {
        // If the key's already in the annotation map, return it.
        if (resource.metadata.annotations[key] !== undefined) {
          return resource.metadata.annotations[key];
        }
        // Try and return a value for a mapped key.
        var mappings = annotationNameFilter(key) || [];
        for (var i=0; i < mappings.length; i++) {
          var mappedKey = mappings[i];
          if (resource.metadata.annotations[mappedKey] !== undefined) {
            return resource.metadata.annotations[mappedKey];
          }
        }
        // Couldn't find anything.
        return null;
      }
      return null;
    };
  })
  .filter('imageStreamTagAnnotation', function() {
    // Look up annotations on ImageStream.spec.tags[tag].annotations
    return function(resource, key, /* optional */ tagName) {
      tagName = tagName || 'latest';
      if (resource && resource.spec && resource.spec.tags){
        var tags = resource.spec.tags;
        for(var i=0; i < _.size(tags); ++i){
          var tag = tags[i];
          if(tagName === tag.name && tag.annotations){
            return tag.annotations[key];
          }
        }
      }

      return null;
    };
  })
  .filter('imageStreamTagTags', function(imageStreamTagAnnotationFilter) {
    // Return ImageStream.spec.tag[tag].annotation.tags as an array
    return function(resource, /* optional */ tagName) {
      var imageTags = imageStreamTagAnnotationFilter(resource, 'tags', tagName);
      if (!imageTags) {
        return [];
      }

      return imageTags.split(/\s*,\s*/);
    };
  })
  .filter('imageStreamTagIconClass', function(imageStreamTagAnnotationFilter) {
  return function(resource, /* optional */ tagName) {
    var icon = imageStreamTagAnnotationFilter(resource, "iconClass", tagName);
    return (icon) ? icon : "fa fa-cube";
  };
});
