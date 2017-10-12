describe("Filter: startCase", function() {
  'use strict';

  var startCaseFilter;

  beforeEach(inject(function (_startCaseFilter_) {
    startCaseFilter = _startCaseFilter_;
  }));

  var tc = [
    ['FooBar', 'Foo Bar'],
    ['fooBar', 'Foo Bar'],
    ['Foo', 'Foo'],
    ['foo-bar', 'Foo Bar'],
    ['FooBarBaz', 'Foo Bar Baz'],
    ['', ''],
    [null, ''],
    [undefined, '']
  ];

  _.each(tc, _.spread(function(input, expected) {
    it('should result in ' + expected + ' when called with ' + input, function() {
      var actual = startCaseFilter(input);
      expect(actual).toEqual(expected);
    });
  }));
});
