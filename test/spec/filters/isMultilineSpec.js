describe("Filter: isMultiline", function() {
  'use strict';

  var isMultilineFilter;

  beforeEach(inject(function (_isMultilineFilter_) {
    isMultilineFilter = _isMultilineFilter_;
  }));

  var tc = [
    ['foo', false, false],
    ['foo\nbar', false, true],
    ['foo\nbar', true, true],
    ['foo\rbar', false, true],
    ['foo\rbar', true, true],
    ['foo\nbar\n', true, true],
    ['foo\rbar\r', true, true],
    ['foo\n', false, true],
    ['foo\n', true, false],
    ['foo\r', false, true],
    ['foo\r', true, false],
    ['', false, false],
    ['', true, false],
    [undefined, false, false],
    [undefined, true, false]
  ];

  _.each(tc, _.spread(function(input, ignoreTrailing, expected) {
    it('should result in ' + expected +
      ' when called with ' + JSON.stringify(input) +
      ' (ignore trailing newline: ' + ignoreTrailing + ')', function() {
      var actual = isMultilineFilter(input, ignoreTrailing);
      expect(actual).toEqual(expected);
    });
  }));
});
