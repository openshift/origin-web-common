'use strict';

angular.module("openshiftCommonServices").
service("ApplicationsService", function(
  $q,
  APIService,
  DataService) {

  var deploymentsVersion = APIService.getPreferredVersion('deployments');
  var deploymentConfigsVersion = APIService.getPreferredVersion('deploymentconfigs');
  var replicationControllersVersion = APIService.getPreferredVersion('replicationcontrollers');
  var replicaSetsVersion = APIService.getPreferredVersion('replicasets');
  var statefulSetsVersion = APIService.getPreferredVersion('statefulsets');

  // List replication controllers in a namespace that are NOT managed by a
  // deployment config. Note: This will not return replication controllers that
  // have been orphaned by `oc delete dc/foo --cascade=false`.
  var listStandaloneReplicationControllers = function(context) {
    return DataService.list(replicationControllersVersion, context, null, {
      http: {
        params: {
          // If the replica set has a `openshift.io/deployment-config-name`
          // label, it's managed by a deployment config.
          labelSelector: "!openshift.io/deployment-config.name"
        }
      }
    });
  };

  // List replica sets in a namespace that are NOT managed by a deployment.
  // Note: This will not return replica sets that have been orphaned by
  // `oc delete deployment/foo --cascade=false`.
  var listStandaloneReplicaSets = function(context) {
    return DataService.list(replicaSetsVersion, context, null, {
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
    promises.push(DataService.list(deploymentConfigsVersion, context));
    promises.push(listStandaloneReplicationControllers(context));
    promises.push(DataService.list(deploymentsVersion, context));
    promises.push(listStandaloneReplicaSets(context));
    promises.push(DataService.list(statefulSetsVersion, context));

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
