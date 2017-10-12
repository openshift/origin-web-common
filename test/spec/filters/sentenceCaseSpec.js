describe("Filter: upperFirst", function() {
  'use strict';

  var upperFirstFilter;

  beforeEach(inject(function (_upperFirstFilter_) {
    upperFirstFilter = _upperFirstFilter_;
  }));

  var tc = [
    ['foo', 'Foo'],
    ['foo bar', 'Foo bar'],
    ['fooBar', 'FooBar'],
    ['', ''],
    [null, ''],
    [undefined, '']
  ];

  _.each(tc, _.spread(function(input, expected) {
    it('should result in ' + expected + ' when called with ' + input, function() {
      var actual = upperFirstFilter(input);
      expect(actual).toEqual(expected);
    });
  }));
});
