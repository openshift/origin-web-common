'use strict';

angular.module('openshiftCommonUI')
  .filter('isAbsoluteURL', function() {
    return function(url) {
      if (!url) {
        return false;
      }
      var uri = new URI(url);
      var protocol = uri.protocol();
      return uri.is('absolute') && (protocol === 'http' || protocol === 'https');
    };
  });
