describe("Filter: humanizeKind", function() {
  'use strict';

  var humanizeKindFilter;

  beforeEach(inject(function (_humanizeKindFilter_) {
    humanizeKindFilter = _humanizeKindFilter_;
  }));

  it('should return a lowercase display kind', function() {
    var result = humanizeKindFilter('DeploymentConfig');
    expect(result).toEqual('deployment config');
  });

  it('should return a title case display kind', function() {
    var result = humanizeKindFilter('DeploymentConfig', true);
    expect(result).toEqual('Deployment Config');
  });

  it('should special case ServiceInstance as "provisioned service"', function() {
    var result = humanizeKindFilter('ServiceInstance');
    expect(result).toEqual('provisioned service');
    result = humanizeKindFilter('ServiceInstance', true);
    expect(result).toEqual('Provisioned Service');
  });

  it('should return the original value if null, undefined, or empty', function() {
    var result = humanizeKindFilter(null);
    expect(result).toBeNull();
    result = humanizeKindFilter();
    expect(result).toBeUndefined();
    result = humanizeKindFilter('');
    expect(result).toEqual('');
  });
});
