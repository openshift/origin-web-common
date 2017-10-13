describe("Filter: parseJSON", function() {
  'use strict';

  var parseJSONFilter;

  var dummyObject = {
    foo: 'bar',
    baz: {
      qux: 1,
      hello: false
    },
    items: ['one', 'two', 'three']
  };

  var dummyArray = dummyObject.items;

  beforeEach(inject(function (_parseJSONFilter_) {
    parseJSONFilter = _parseJSONFilter_;
  }));

  it('should parse a valid JSON object', function() {
    var json = JSON.stringify(dummyObject);
    var parsedObject = parseJSONFilter(json);
    expect(parsedObject).toEqual(dummyObject);
  });

  it('should parse a valid JSON array', function() {
    var json = JSON.stringify(dummyArray);
    var parsedArray = parseJSONFilter(json);
    expect(parsedArray).toEqual(dummyArray);
  });

  it('should return null if not a JSON object or array', function() {
    var parsedObject = parseJSONFilter('1');
    expect(parsedObject).toBeNull();
    parsedObject = parseJSONFilter('"foo"');
    expect(parsedObject).toBeNull();
    parsedObject = parseJSONFilter('true');
    expect(parsedObject).toBeNull();
  });

  it('should return null for on null, undefined, or empty input', function() {
    var parsedObject = parseJSONFilter(null);
    expect(parsedObject).toBeNull();
    parsedObject = parseJSONFilter(undefined);
    expect(parsedObject).toBeNull();
    parsedObject = parseJSONFilter('');
    expect(parsedObject).toBeNull();
  });

  it('should return null for invalid JSON', function() {
    var json = JSON.stringify(dummyObject) + 'invalid';
    var parsedObject = parseJSONFilter(json);
    expect(parsedObject).toBeNull();
  });
});
