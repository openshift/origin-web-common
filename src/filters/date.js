'use strict';

angular.module('openshiftCommonUI')
  .filter('isNewerResource', function() {
    // Checks if candidate is newer than other.
    return function(candidate, other) {
      var candidateCreation = _.get(candidate, 'metadata.creationTimestamp');
      if (!candidateCreation) {
        return false;
      }

      var otherCreation = _.get(other, 'metadata.creationTimestamp');
      if (!otherCreation) {
        return true;
      }

      // The date format can be compared using straight string comparison.
      // Example Date: 2016-02-02T21:53:07Z
      return candidateCreation > otherCreation;
    };
  })
  .filter('mostRecent', function(isNewerResourceFilter) {
    return function(objects) {
      var mostRecent = null;
      _.each(objects, function(object) {
        if (!mostRecent || isNewerResourceFilter(object, mostRecent)) {
          mostRecent = object;
        }
      });

      return mostRecent;
    };
  })
  .filter('orderObjectsByDate', function(toArrayFilter) {
    return function(items, reverse) {
      items = toArrayFilter(items);

      /*
       * Note: This is a hotspot in our code. We sort frequently by date on
       *       the overview and browse pages.
       */

      items.sort(function (a, b) {
        if (!a.metadata || !a.metadata.creationTimestamp || !b.metadata || !b.metadata.creationTimestamp) {
          throw "orderObjectsByDate expects all objects to have the field metadata.creationTimestamp";
        }

        // The date format can be sorted using straight string comparison.
        // Compare as strings for performance.
        // Example Date: 2016-02-02T21:53:07Z
        if (a.metadata.creationTimestamp < b.metadata.creationTimestamp) {
          return reverse ? 1 : -1;
        }

        if (a.metadata.creationTimestamp > b.metadata.creationTimestamp) {
          return reverse ? -1 : 1;
        }

        return 0;
      });

      return items;
    };
  });
