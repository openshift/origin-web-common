describe("Filter: alertIcon", function() {
  'use strict';

  var alertIconFilter;

  beforeEach(inject(function (_alertIconFilter_) {
    alertIconFilter = _alertIconFilter_;
  }));

  var tc = [
    ['error', 'pficon pficon-error-circle-o'],
    ['Error', 'pficon pficon-error-circle-o'],
    ['ERROR', 'pficon pficon-error-circle-o'],
    ['warning', 'pficon pficon-warning-triangle-o'],
    ['Warning', 'pficon pficon-warning-triangle-o'],
    ['WARNING', 'pficon pficon-warning-triangle-o'],
    ['success', 'pficon pficon-ok'],
    ['Success', 'pficon pficon-ok'],
    ['SUCCESS', 'pficon pficon-ok'],
    ['normal', 'pficon pficon-info'],
    ['unknown', 'pficon pficon-info'],
    ['', 'pficon pficon-info'],
    [undefined, 'pficon pficon-info'],
  ];

  _.each(tc, _.spread(function(input, expected) {
    it('should result in ' + expected + ' when called with ' + input, function() {
      var actual = alertIconFilter(input);
      expect(actual).toEqual(expected);
    });
  }));
});
