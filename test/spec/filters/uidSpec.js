describe("Filter: uid", function() {
  'use strict';

  var uidFilter;

  beforeEach(inject(function (_uidFilter_) {
    uidFilter = _uidFilter_;
  }));

  it('should return the uid for an API object', function() {
    var testUID = 'ea1e8dcf-aecb-11e7-8d0c-b6c718ff6445';
    var result = uidFilter({
      metadata: {
        uid: testUID
      }
    });
    expect(result).toEqual(testUID);
  });

  it('should return the object itself if it has no UID', function() {
    var object = {
      metadata: {
        name: 'my-new-object'
      }
    };
    var result = uidFilter(object);
    expect(result).toEqual(object);
  });

  it('should return the original value if null or undefined', function() {
    var result = uidFilter(null);
    expect(result).toBeNull();
    result = uidFilter();
    expect(result).toBeUndefined();
  });
});
