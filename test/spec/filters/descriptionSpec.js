describe("Filter: description", function() {
  'use strict';

  var descriptionFilter;

  beforeEach(inject(function (_descriptionFilter_) {
    descriptionFilter = _descriptionFilter_;
  }));

  it('should return the description for the openshift.io/description annotation', function() {
    var testDescription = 'My project.';
    var result = descriptionFilter({
      metadata: {
        annotations: {
          'openshift.io/description': testDescription
        }
      }
    });
    expect(result).toEqual(testDescription);
  });

  it('should return the description for the kubernetes.io/description annotation', function() {
    var testDescription = 'My project.';
    var result = descriptionFilter({
      metadata: {
        annotations: {
          'kubernetes.io/description': testDescription
        }
      }
    });
    expect(result).toEqual(testDescription);
  });

  it('should return the description for the description annotation with no namespace', function() {
    var testDescription = 'My project.';
    var result = descriptionFilter({
      metadata: {
        annotations: {
          'description': testDescription
        }
      }
    });
    expect(result).toEqual(testDescription);
  });

  it('should prefer the openshift.io/description annotation', function() {
    var testDescription = 'My project.';
    var result = descriptionFilter({
      metadata: {
        annotations: {
          'description': 'not this one',
          'kubernetes.io/description': 'or this one',
          'openshift.io/description': testDescription
        }
      }
    });
    expect(result).toEqual(testDescription);
  });

  it('should prefer the kubernetes.io/description annotation over the one with no namespace', function() {
    var testDescription = 'My project.';
    var result = descriptionFilter({
      metadata: {
        annotations: {
          'description': 'not this one',
          'kubernetes.io/description': testDescription
        }
      }
    });
    expect(result).toEqual(testDescription);
  });

  it('should return the null if no description annotation', function() {
    var object = {
      metadata: {
        name: 'my-new-object'
      }
    };
    var result = descriptionFilter(object);
    expect(result).toBeNull();
  });

  it('should return null if input is null or undefined', function() {
    var result = descriptionFilter(null);
    expect(result).toBeNull();
    result = descriptionFilter();
    expect(result).toBeNull();
  });
});
