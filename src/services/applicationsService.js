'use strict';

angular.module("openshiftCommonServices").
service("ApplicationsService", function($filter, $q, DataService) {

  var getApplications = function(context) {
    var deferred = $q.defer();
    var promises = [];

    // Load all the "application" types
    promises.push(DataService.list('deploymentconfigs', context));
    promises.push(DataService.list('replicationcontrollers', context));
    promises.push(DataService.list({group: 'apps', resource: 'deployments'}, context));
    promises.push(DataService.list({group: 'extensions', resource: 'replicasets'}, context));
    promises.push(DataService.list({group: 'apps', resource: 'statefulsets'}, context));

    $q.all(promises).then(_.spread(function(deploymentConfigData, replicationControllerData, deploymentData, replicaSetData, statefulSetData) {
      var deploymentConfigs = _.toArray(deploymentConfigData.by('metadata.name'));
      var replicationControllers = _.reject(replicationControllerData.by('metadata.name'), $filter('hasDeploymentConfig'));
      var deployments = _.toArray(deploymentData.by('metadata.name'));
      var replicaSets = _.reject(replicaSetData.by('metadata.name'), $filter('hasDeployment'));
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
    getApplications: getApplications
  };
});
