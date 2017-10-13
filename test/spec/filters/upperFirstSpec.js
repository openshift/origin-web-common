describe("Filter: sentenceCase", function() {
  'use strict';

  var sentenceCaseFilter;

  beforeEach(inject(function (_sentenceCaseFilter_) {
    sentenceCaseFilter = _sentenceCaseFilter_;
  }));

  var tc = [
    ['FooBar', 'Foo bar'],
    ['fooBar', 'Foo bar'],
    ['Foo', 'Foo'],
    ['foo-bar', 'Foo bar'],
    ['FooBarBaz', 'Foo bar baz'],
    ['', ''],
    [null, ''],
    [undefined, '']
  ];

  _.each(tc, _.spread(function(input, expected) {
    it('should result in ' + expected + ' when called with ' + input, function() {
      var actual = sentenceCaseFilter(input);
      expect(actual).toEqual(expected);
    });
  }));
});
