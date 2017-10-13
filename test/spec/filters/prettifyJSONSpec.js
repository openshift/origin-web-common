describe("Filter: prettifyJSON", function() {
  'use strict';

  var prettifyJSONFilter;

  var dummyObject = {
    foo: 'bar',
    baz: {
      qux: 1,
      hello: false
    },
    items: ['one', 'two', 'three']
  };

  beforeEach(inject(function (_prettifyJSONFilter_) {
    prettifyJSONFilter = _prettifyJSONFilter_;
  }));

  it('should parse a valid JSON object', function() {
    var json = JSON.stringify(dummyObject);
    var result = prettifyJSONFilter(json);
    expect(result).toEqual(JSON.stringify(dummyObject, null, 4));
  });

  it('should return the original object if not a JSON string', function() {
    var result = prettifyJSONFilter(null);
    expect(result).toBeNull();
    result = prettifyJSONFilter();
    expect(result).toBeUndefined();
    result = prettifyJSONFilter('');
    expect(result).toBe('');
  });

  it('should return the original value for invalid JSON', function() {
    var json = JSON.stringify(dummyObject) + 'invalid';
    var parsedObject = prettifyJSONFilter(json);
    expect(parsedObject).toBe(json);
  });
});
