describe("Filter: serviceClassDisplayName", function() {
  'use strict';

  var serviceClassDisplayNameFilter;

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

  beforeEach(inject(function (_serviceClassDisplayNameFilter_) {
    serviceClassDisplayNameFilter = _serviceClassDisplayNameFilter_;
  }));

  it('should return the external metadata display name when set', function() {
    var result = serviceClassDisplayNameFilter(mockServiceClass);
    expect(result).toEqual("Jenkins (Ephemeral)");
  });

  it('should fall back to external name when no external metadata display name', function() {
    var serviceClass = angular.copy(mockServiceClass);
    delete serviceClass.spec.externalMetadata.displayName;
    var result = serviceClassDisplayNameFilter(serviceClass);
    expect(result).toEqual("jenkins-ephemeral");
  });

  it('should return undefined for null input', function() {
    var result = serviceClassDisplayNameFilter(null);
    expect(result).toBeUndefined();
  });

  it('should return undefined for undefined input', function() {
    var result = serviceClassDisplayNameFilter(undefined);
    expect(result).toBeUndefined();
  });

  it('should return undefined for an empty object', function() {
    var result = serviceClassDisplayNameFilter({});
    expect(result).toBeUndefined();
  });
});
