describe("Filter: camelToLower", function() {
  'use strict';

  var camelToLowerFilter;

  beforeEach(inject(function (_camelToLowerFilter_) {
    camelToLowerFilter = _camelToLowerFilter_;
  }));

  var tc = [
    ['FooBar', 'foo bar'],
    ['fooBar', 'foo bar'],
    ['Foo', 'foo'],
    ['foo-bar', 'foo bar'],
    ['FooBarBaz', 'foo bar baz'],
    ['', ''],
    [null, ''],
    [undefined, '']
  ];

  _.each(tc, _.spread(function(input, expected) {
    it('should result in ' + expected + ' when called with ' + input, function() {
      var actual = camelToLowerFilter(input);
      expect(actual).toEqual(expected);
    });
  }));
});
