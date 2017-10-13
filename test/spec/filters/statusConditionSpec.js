describe("Filter: statusCondition", function() {
  'use strict';

  var statusConditionFilter;

  var mockAPIObject = {
    metadata: {},
    spec: {},
    status: {
      conditions: []
    }
  };

  var readyCondition = {
    "type": "Ready",
    "status": "True",
    "lastTransitionTime": "2017-10-11T21:17:16Z",
    "reason": "ProvisionedSuccessfully",
    "message": "The instance was provisioned successfully"
  };

  var failedCondition = {
    "type": "Failed",
    "status": "True",
    "lastTransitionTime": "2017-10-11T21:17:16Z",
    "reason": "ProvisionCallFailed",
    "message": 'Provision call failed: ServiceInstance "test/mariadb-persistent-6q4zn": Error provisioning: "secrets \"mariadb\" already exists\nservices \"mariadb\" already exists\npersistentvolumeclaims \"mariadb\" already exists\ndeploymentconfigs \"mariadb\" already exists"'
  };

  beforeEach(inject(function (_statusConditionFilter_) {
    statusConditionFilter = _statusConditionFilter_;
  }));

  it('should return the condition when it exists', function() {
    var apiObject = angular.copy(mockAPIObject);
    apiObject.status.conditions.push(readyCondition);
    var result = statusConditionFilter(apiObject, 'Ready');
    expect(result).toEqual(readyCondition);
  });

  it('should return the correct condition when there is more than one', function() {
    var apiObject = angular.copy(mockAPIObject);
    apiObject.status.conditions.push(readyCondition);
    apiObject.status.conditions.push(failedCondition);
    var result = statusConditionFilter(apiObject, 'Failed');
    expect(result).toEqual(failedCondition);
  });

  it('should return undefined when there are no status conditions', function() {
    var result = statusConditionFilter(mockAPIObject);
    expect(result).toBeUndefined();
  });

  it('should return undefined when a different status condition is set', function() {
    var apiObject = angular.copy(mockAPIObject);
    var condition = angular.copy(readyCondition);
    condition.type = "AnotherCondition";
    apiObject.status.conditions.push(condition);
    var result = statusConditionFilter(apiObject);
    expect(result).toBeUndefined();
  });

  it('should return null for null or undefined input', function() {
    var result = statusConditionFilter(null);
    expect(result).toBeNull();
    result = statusConditionFilter(undefined);
    expect(result).toBeNull();
  });
});
