'use strict';

angular.module('openshiftCommonServices')
  .factory('PromiseUtils', function($q) {
    return {
      // Returns a promise that is resolved or rejected only after all promises
      // complete. `promises` is a collection of promises. `null` or
      // `undefined` values are treated as "complete."
      //
      // Different than `$q.all` in that it will always wait for all promises.
      // `$q.all` short circuits as soon as one fails.
      //
      // Also unlike `$q.all`, this method does not return any values when
      // resolving or reasons when rejecting the promise.
      waitForAll: function(promises) {
        var total = _.size(promises);
        if (!total) {
          return $q.when();
        }

        var deferred = $q.defer();
        var complete = 0;
        var failed = false;
        var checkDone = function() {
          if (complete < total) {
            return;
          }

          if (failed) {
            deferred.reject();
          } else {
            deferred.resolve();
          }
        };

        _.each(promises, function(promise) {
          if (!promise) {
            complete++;
            checkDone();
            return;
          }

          promise.catch(function() {
            failed = true;
          }).finally(function() {
            complete++;
            checkDone();
          });
        });

        return deferred.promise;
      }
    };
  });
