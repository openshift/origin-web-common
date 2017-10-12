describe("Filter: capitalize", function() {
  'use strict';

  var capitalizeFilter;

  beforeEach(inject(function (_capitalizeFilter_) {
    capitalizeFilter = _capitalizeFilter_;
  }));

  var tc = [
    ['FooBar', 'Foobar'],
    ['fooBar', 'Foobar'],
    ['foo', 'Foo'],
    ['Foo', 'Foo'],
    ['foo-bar', 'Foo-bar'],
    ['Foo Bar Baz', 'Foo bar baz'],
    ['', ''],
    [null, ''],
    [undefined, '']
  ];

  _.each(tc, _.spread(function(input, expected) {
    it('should result in ' + expected + ' when called with ' + input, function() {
      var actual = capitalizeFilter(input);
      expect(actual).toEqual(expected);
    });
  }));
});
