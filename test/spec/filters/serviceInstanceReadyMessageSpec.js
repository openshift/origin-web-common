describe("Filter: serviceInstanceReadyMessage", function() {
  'use strict';

  var serviceInstanceReadyMessageFilter;

  var mockServiceInstance = {
    "apiVersion": "servicecatalog.k8s.io/v1beta1",
    "kind": "ServceInstance",
    "metadata": {
      "name": "mariadb-persistent-6q4zn",
      "namespace": "test",
      "uid": "6a31b3ce-aec9-11e7-bae6-0242ac110002",
    },
    "spec": {
      "clusterServiceClassExternalName": "mariadb-persistent",
      "externalClusterServicePlanName": "default",
      "clusterServiceClassRef": {
        "name": "475554bf-aec9-11e7-8d0c-b6c718ff6445",
        "uid": "581f692a-aec9-11e7-bae6-0242ac110002",
        "resourceVersion": "20"
      },
      "clusterServicePlanRef": {
        "name": "475554bf-aec9-11e7-8d0c-b6c718ff6445",
        "uid": "5704c949-aec9-11e7-bae6-0242ac110002",
        "resourceVersion": "8"
      },
      "parametersFrom": [
        {
          "secretKeyRef": {
            "name": "mariadb-persistent-parameters-s6zzf",
            "key": "parameters"
          }
        }
      ],
      "externalID": "8066697b-530b-486d-a6e2-5ff2b8d8febb",
      "updateRequests": 0
    },
    "status": {
      "conditions": []
    }
  };

  var readyCondition = {
    "type": "Ready",
    "status": "True",
    "lastTransitionTime": "2017-10-11T21:17:16Z",
    "reason": "ProvisionedSuccessfully",
    "message": "The instance was provisioned successfully"
  };

  var pendingCondition = {
    "type": "Ready",
    "status": "False",
    "lastTransitionTime": "2017-10-11T21:17:16Z",
    "reason": "Provisioning",
    "message": "The instance is being provisioned asynchronously"
  };

  beforeEach(inject(function (_serviceInstanceReadyMessageFilter_) {
    serviceInstanceReadyMessageFilter = _serviceInstanceReadyMessageFilter_;
  }));

  it('should return the message when the instance is ready', function() {
    var serviceInstance = angular.copy(mockServiceInstance);
    serviceInstance.status.conditions.push(readyCondition);
    var result = serviceInstanceReadyMessageFilter(serviceInstance);
    expect(result).toBe("The instance was provisioned successfully");
  });

  it('should return the message when the instance is not ready', function() {
    var serviceInstance = angular.copy(mockServiceInstance);
    serviceInstance.status.conditions.push(pendingCondition);
    var result = serviceInstanceReadyMessageFilter(serviceInstance);
    expect(result).toBe("The instance is being provisioned asynchronously");
  });

  it('should return undefined when there are no status conditions', function() {
    var result = serviceInstanceReadyMessageFilter(mockServiceInstance);
    expect(result).toBeUndefined();
  });

  it('should return undefined when a different status condition is set', function() {
    var serviceInstance = angular.copy(mockServiceInstance);
    var condition = angular.copy(readyCondition);
    condition.type = "AnotherCondition";
    serviceInstance.status.conditions.push(condition);
    var result = serviceInstanceReadyMessageFilter(serviceInstance);
    expect(result).toBeUndefined();
  });
});
