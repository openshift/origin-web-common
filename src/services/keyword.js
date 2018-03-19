'use strict';

angular.module("openshiftCommonServices")
  .service("KeywordService", function($filter) {

    var displayName = $filter('displayName');

    var generateKeywords = function(filterText) {
      if (!filterText) {
        return [];
      }

      var keywords = _.uniq(filterText.match(/\S+/g));

      // Sort the longest keyword first.
      keywords.sort(function(a, b){
        return b.length - a.length;
      });

      // Convert the keyword to a case-insensitive regular expression for the filter.
      return _.map(keywords, function(keyword) {
        return new RegExp(_.escapeRegExp(keyword), "i");
      });
    };

    var filterForKeywords = function(objects, filterFields, keywords) {
      var filteredObjects = objects;
      if (_.isEmpty(keywords)) {
        return filteredObjects;
      }

      // Find resources that match all keywords.
      angular.forEach(keywords, function(regex) {
        var matchesKeyword = function(obj) {
          var i;
          for (i = 0; i < filterFields.length; i++) {
            var value = _.get(obj, filterFields[i]);
            if (value && regex.test(value)) {
              return true;
            }
          }

          return false;
        };

        filteredObjects = _.filter(filteredObjects, matchesKeyword);
      });
      return filteredObjects;
    };

    // Perform a simple weighted search.
    // weightedSearch is like filterForKeywords, except each field has a weight
    // and the result is a sorted array of matches. filterFields is an array of
    // objects with keys `path` and `weight`.
    var weightedSearch = function(objects, filterFields, keywords) {
      if (_.isEmpty(keywords)) {
        return [];
      }

      var results = [];
      _.each(objects, function(object) {
        // Keep a score for matches, weighted by field.
        var score = 0;
        _.each(keywords, function(regex) {
          var matchesKeyword = false;
          _.each(filterFields, function(field) {
            var value = _.get(object, field.path);
            if (!value) {
              return;
            }

            if (regex.test(value)) {
              // For each matching keyword, add the field weight to the score.
              score += field.weight;
              matchesKeyword = true;
            }
          });

          if (!matchesKeyword) {
            // We've missed a keyword. Set score to 0 and short circuit the loop.
            score = 0;
            return false;
          }
        });

        if (score > 0) {
          results.push({
            object: object,
            score: score
          });
        }
      });

      // Sort first by score, then by display name for items that have the same score.
      var orderedResult = _.orderBy(results, ['score', displayName], ['desc', 'asc']);
      return _.map(orderedResult, 'object');
    };

    return {
      filterForKeywords: filterForKeywords,
      weightedSearch: weightedSearch,
      generateKeywords: generateKeywords
    };
  });
