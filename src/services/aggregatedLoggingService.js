'use strict';

angular.module("openshiftCommonServices")
  .factory("AggregatedLoggingService", function($q, $cacheFactory, Logger, $interval, APIService, DataService) {

    var currentUser = null;
    var cachedUserPermissions = $cacheFactory('operationsUsersCache', {
          number: 10
        });

    inFlightPermissionsRequests = {};

    // Create SelfSubjectAccessReview request againt authorization API to check whether
    // current user can view pods/log from 'openshift-logging' project.
    // Users who can view such logs are 'operations' users
    var fetchUserPermisions = function(userName) {
      var deferred = $q.defer();
      currentUser = userName;
      var userAllowed = cachedUserPermissions.get(userName);

      if (!userAllowed) {
          // If a request is already in flight, return the promise for that request.
          if (inFlightPermissionsRequests[userName]) {
            return inFlightPermissionsRequests[userName];
          }

          Logger.log("AggregatedLoggingService, loading whether user " + userName + " is Operations user");
          inFlightPermissionsRequests[userName] = deferred.promise;
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
          DataService.create({ group: 'authorization.k8s.io', version: 'v1', resource: 'selfsubjectaccessreviews'},
                            null, ssar, {namespace: 'openshift-logging'}).then(
            function(data) {
              var isAllowed = data.status.allowed;
              cachedUserPermissions.put(userName, {'allowed': isAllowed,
                                                    forceRefresh: false,
                                                    cacheTimestamp: _.now()
                                                  });
              deferred.resolve();
            }, function() {
              deferred.resolve();
          }).finally(function() {
            delete inFlightPermissionsRequests[userName];
          });

      } else {
        // Using cached data.
        Logger.log("AggregatedLoggingService, using cached user " + userName);
        if ((_.now() - userAllowed.cacheTimestamp) >= 600000) {
          userAllowed.forceRefresh = true;
        }
        deferred.resolve();
      }
      return deferred.promise;
    };

    var isOperationsUser = function(userName) {
      return !!_.get(cachedUserPermissions.get(userName || currentUser), ['allowed']);
    };

    return {
      fetchUserPermisions: fetchUserPermisions,
      isOperationsUser: isOperationsUser
    };
  });
