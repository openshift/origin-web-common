'use strict';

angular.module("openshiftCommonUI")
  .filter("normalizeIconClass", function() {
    return function(iconClass) {
      // if iconClass starts with "icon-", append "font-icon "
      // so the Openshift Logos Icon font is used
      if(_.startsWith(iconClass, "icon-")) {
        return "font-icon " + iconClass;
      } else {
        return iconClass;
      }
    };
  });
