'use strict';

angular.module('openshiftCommonUI')
  // Returns an image URL for an icon class if available. Some icons we have
  // color SVG images for. Depends on window.OPENSHIFT_CONSTANTS.LOGOS and
  // window.OPENSHIFT_CONSTANTS.LOGO_BASE_URL, which is set by origin-web-console
  // (or an extension).
  .filter('imageForIconClass', function($window, isAbsoluteURLFilter) {
    return function(iconClass) {
      if (!iconClass) {
        return '';
      }

      var logoImage = _.get($window, ['OPENSHIFT_CONSTANTS', 'LOGOS', iconClass]);
      if (!logoImage) {
        return '';
      }

      // Make sure the logo base has a trailing slash.
      var logoBaseUrl = _.get($window, 'OPENSHIFT_CONSTANTS.LOGO_BASE_URL');
      if (!logoBaseUrl || isAbsoluteURLFilter(logoImage)) {
        return logoImage;
      }

      if (!_.endsWith(logoBaseUrl, '/')) {
        logoBaseUrl += '/';
      }

      return logoBaseUrl + logoImage;
    };
  });
