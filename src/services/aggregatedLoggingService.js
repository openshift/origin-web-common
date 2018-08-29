'use strict';

angular.module("openshiftCommonServices")
  .factory("AggregatedLoggingService", function($q, $cacheFactory, Logger, $interval, APIService, DataService) {

    var cachedUserPermissions = $cacheFactory('operationsUsersCache', {
      number: 10
    });

    var inFlightPermissionsRequest = null;
    var authPromise = null;

    // Create SelfSubjectAccessReview request againt authorization API to check whether
    // current user can view pods/log from 'openshift-logging' project.
    // Users who can view such logs are 'operations' users
    var isOperationsUser = function(userName) {
      var userAllowed = cachedUserPermissions.get(userName);

      if (!userAllowed) {
        // If a request is already in flight, return the promise for that request.
        if (inFlightPermissionsRequest) {
          return inFlightPermissionsRequest;
        }

        Logger.log("AggregatedLoggingService, loading whether user " + userName + " is Operations user");
        var ssar = {
          apiVersion: 'authorization.k8s.io/v1',
          kind: 'SelfSubjectAccessReview',
          spec: {
            resourceAttributes: {
              resource: 'pods/log',
              namespace: 'openshift-logging',
              verb: 'view'
            }
          }
        };
        authPromise = DataService.create({ group: 'authorization.k8s.io', version: 'v1', resource: 'selfsubjectaccessreviews'},
                          null, ssar, {namespace: 'openshift-logging'}).then(
          function(data) {
            var isAllowed = data.status.allowed;
            cachedUserPermissions.put(userName, {'allowed': isAllowed,
                                                  forceRefresh: false,
                                                  cacheTimestamp: _.now()
                                                });
            return Promise.resolve(isAllowed);
          }, function() {
            return Promise.resolve(false);
        }).finally(function() {
          inFlightPermissionsRequest = null;
        });
        inFlightPermissionsRequest = authPromise;
      } else {
        // Using cached data.
        Logger.log("AggregatedLoggingService, using cached user " + userName);
        if ((_.now() - userAllowed.cacheTimestamp) >= 600000) {
          userAllowed.forceRefresh = true;
        }
        return $q.when(!!_.get(userAllowed, ['allowed']));
      }
      return authPromise;
    };

    return {
      isOperationsUser: isOperationsUser
    };
  });
