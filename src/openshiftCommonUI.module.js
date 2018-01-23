/**
 * @name  openshiftCommonUI
 *
 * @description
 *   Base module for openshiftCommonUI.
 */
angular.module('openshiftCommonUI', [])
// Sometimes we need to know the css breakpoints, make sure to update this
// if they ever change!
.constant("BREAKPOINTS", {
  screenXsMin:  480,   // screen-xs
  screenSmMin:  768,   // screen-sm
  screenMdMin:  992,   // screen-md
  screenLgMin:  1200,  // screen-lg
  screenXlgMin: 1600   // screen-xlg
})
// DNS1123 subdomain patterns are used for name validation of many resources,
// including persistent volume claims, config maps, and secrets.
// See https://github.com/kubernetes/kubernetes/blob/master/pkg/api/validation/validation.go
.constant('DNS1123_SUBDOMAIN_VALIDATION', {
  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
  maxlength: 253,
  description: 'Name must consist of lower-case letters, numbers, periods, and hyphens. It must start and end with a letter or a number.'
})
// URI_PATH_FRAGMENT_VALIDATION patterns must consist of following characters:
// a-z A-Z 0-9 . - _ ~ ! $ & ' ( ) * + , ; = : @
// https://stackoverflow.com/questions/4669692/valid-characters-for-directory-part-of-a-url-for-short-links
.constant('URI_PATH_FRAGMENT_VALIDATION', {
  pattern: /^[a-zA-Z0-9.\-_~!$&'()*+,;=:@]+$/,
  minlength: 8,
  description: 'Value must consist of characters that can be contained URI path segment.'
})
// http://stackoverflow.com/questions/9038625/detect-if-device-is-ios
.constant('IS_IOS', /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);


hawtioPluginLoader.addModule('openshiftCommonUI');
