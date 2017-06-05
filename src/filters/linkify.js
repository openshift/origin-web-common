'use strict';

angular.module('openshiftCommonUI')
// Usage: <span ng-bind-html="text | linkify : '_blank'"></span>
//
// Prefer this to the AngularJS `linky` filter since it only matches http and
// https URLs. We've had issues with incorretly matching email addresses.
//
// https://github.com/openshift/origin-web-console/issues/315
// See also HTMLService.linkify
.filter('linkify', function(HTMLService) {
  return function(text, target, alreadyEscaped) {
    return HTMLService.linkify(text, target, alreadyEscaped);
  };
});
