'use strict';

angular.module('openshiftCommonUI')
  .filter("toArray", function() {
    return function (items) {
      if (!items) {
        return [];
      }

      if (angular.isArray(items)) {
        return items;
      }

      var itemsArray = [];
      angular.forEach(items, function (item) {
        itemsArray.push(item);
      });

      return itemsArray;
    };
  })
  .filter('hashSize', function() {
    return function(hash) {
      if(!hash) { return 0; }
      return Object.keys(hash).length;
    };
  });
