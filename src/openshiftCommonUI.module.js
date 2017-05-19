/**
 * @name  openshiftCommonUI
 *
 * @description
 *   Base module for openshiftCommonUI.
 */
angular.module('openshiftCommonUI', [])
// DNS1123 subdomain patterns are used for name validation of many resources,
// including persistent volume claims, config maps, and secrets.
// See https://github.com/kubernetes/kubernetes/blob/master/pkg/api/validation/validation.go
.constant('DNS1123_SUBDOMAIN_VALIDATION', {
  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
  maxlength: 253,
  description: 'Name must consist of lower-case letters, numbers, periods, and hyphens. It must start and end with a letter or a number.'
});


hawtioPluginLoader.addModule('openshiftCommonUI');
