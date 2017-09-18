'use strict';

angular.module("openshiftCommonServices").
service("ApplicationsService", function($q, DataService) {

  // List replication controllers in a namespace that are NOT managed by a
  // deployment config. Note: This will not return replication controllers that
  // have been orphaned by `oc delete dc/foo --cascade=false`.
  var listStandaloneReplicationControllers = function(context) {
    return DataService.list('replicationcontrollers', context, {
      http: {
        params: {
          // If the replica set has a `openshift.io/deployment-config-name`
          // label, it's managed by a deployment config.
          labelSelector: "!openshift.io/deployment-config-name"
        }
      }
    });
  };

  // List replica sets in a namespace that are NOT managed by a deployment.
  // Note: This will not return replica sets that have been orphaned by
  // `oc delete deployment/foo --cascade=false`.
  var listStandaloneReplicaSets = function(context) {
    return DataService.list({group: 'extensions', resource: 'replicasets'}, context, {
      http: {
        params: {
          // If the replica set has a `pod-template-hash` label, it's managed
          // by a deployment.
          labelSelector: "!pod-template-hash"
        }
      }
    });
  };

  var getApplications = function(context) {
    var deferred = $q.defer();
    var promises = [];

    // Load all the "application" types
    promises.push(DataService.list('deploymentconfigs', context));
    promises.push(listStandaloneReplicationControllers(context));
    promises.push(DataService.list({group: 'apps', resource: 'deployments'}, context));
    promises.push(listStandaloneReplicaSets(context));
    promises.push(DataService.list({group: 'apps', resource: 'statefulsets'}, context));

    $q.all(promises).then(_.spread(function(deploymentConfigData, replicationControllerData, deploymentData, replicaSetData, statefulSetData) {
      var deploymentConfigs = _.toArray(deploymentConfigData.by('metadata.name'));
      var replicationControllers = _.toArray(replicationControllerData.by('metadata.name'));
      var deployments = _.toArray(deploymentData.by('metadata.name'));
      var replicaSets = _.toArray(replicaSetData.by('metadata.name'));
      var statefulSets = _.toArray(statefulSetData.by('metadata.name'));

      var apiObjects = deploymentConfigs.concat(deployments)
        .concat(replicationControllers)
        .concat(replicaSets)
        .concat(statefulSets);
      deferred.resolve(_.sortBy(apiObjects, ['metadata.name', 'kind']));
    }), function(e) {
      deferred.reject(e);
    });

    return deferred.promise;
  };

  return {
    listStandaloneReplicationControllers: listStandaloneReplicationControllers,
    listStandaloneReplicaSets: listStandaloneReplicaSets,
    getApplications: getApplications
  };
});
