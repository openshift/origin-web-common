describe("Filter: serviceInstanceDisplayName", function() {
  'use strict';

  var serviceInstanceDisplayNameFilter;

  var mockServiceClass = {
    kind: "ClusterServiceClass",
    apiVersion: "servicecatalog.k8s.io/v1beta1",
    metadata: {
      name: "470d854c-aec9-11e7-8d0c-b6c718ff6445"
    },
    spec: {
      externalName: "jenkins-ephemeral",
      externalMetadata: {
        displayName: "Jenkins (Ephemeral)",
      }
    },
    status: {}
  };

  var mockServiceInstance = {
    metadata: {
      name: 'jenkins-ephemeral-2jk9x'
    },
    spec: {
      clusterServiceClassExternalName: 'jenkins-ephemeral'
    }
  };

  beforeEach(inject(function (_serviceInstanceDisplayNameFilter_) {
    serviceInstanceDisplayNameFilter = _serviceInstanceDisplayNameFilter_;
  }));

  it('should return the service class external metadata display name when set', function() {
    var result = serviceInstanceDisplayNameFilter(mockServiceInstance, mockServiceClass);
    expect(result).toEqual("Jenkins (Ephemeral)");
  });

  it('should fall back to service class external name when no external metadata display name', function() {
    var serviceClass = angular.copy(mockServiceClass);
    delete serviceClass.spec.externalMetadata.displayName;
    var result = serviceInstanceDisplayNameFilter(mockServiceInstance, serviceClass);
    expect(result).toEqual("jenkins-ephemeral");
  });

  it('should fall back to spec.clusterServiceClassExternalName when no service class', function() {
    var result = serviceInstanceDisplayNameFilter(mockServiceInstance);
    expect(result).toEqual("jenkins-ephemeral");
  });

  it('should return undefined for null or undefined input', function() {
    var result = serviceInstanceDisplayNameFilter(null);
    expect(result).toBeUndefined();
    result = serviceInstanceDisplayNameFilter(undefined);
    expect(result).toBeUndefined();
    result = serviceInstanceDisplayNameFilter({});
    expect(result).toBeUndefined();
  });
});
