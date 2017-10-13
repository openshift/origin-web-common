describe("Filter: displayName", function() {
  'use strict';

  var displayNameFilter;

  beforeEach(inject(function (_displayNameFilter_) {
    displayNameFilter = _displayNameFilter_;
  }));

  it('should return metadata.name if no display name annotation', function() {
    var name = 'my-project';
    var result = displayNameFilter({
      metadata: {
        name: name
      }
    });
    expect(result).toEqual(name);
  });

  it('should return null if no display name annotation and annotationOnly is true', function() {
    var name = 'my-object';
    var result = displayNameFilter({
      metadata: {
        name: name
      }
    }, true);
    expect(result).toBeNull();
  });

  it('should return the openshift.io/display-name annotation value', function() {
    var displayName = 'My Project';
    var object = {
      metadata: {
        name: name,
        annotations: {
          'openshift.io/display-name': displayName
        }
      }
    };
    var result = displayNameFilter(object);
    expect(result).toEqual(displayName);

    // Check that the result is the same if specifying annotationOnly.
    result = displayNameFilter(object, true);
    expect(result).toEqual(displayName);
  });

  it('should return the null if input is null, undefined, or empty', function() {
    var result = displayNameFilter(null);
    expect(result).toBeNull();
    result = displayNameFilter();
    expect(result).toBeNull();
    result = displayNameFilter({});
    expect(result).toBeNull();
  });
});
