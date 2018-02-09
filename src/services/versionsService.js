'use strict';

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
