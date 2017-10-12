describe("Filter: alertStatus", function() {
  'use strict';

  var alertStatusFilter;

  beforeEach(inject(function (_alertStatusFilter_) {
    alertStatusFilter = _alertStatusFilter_;
  }));

  var tc = [
    ['error', 'alert-danger'],
    ['Error', 'alert-danger'],
    ['ERROR', 'alert-danger'],
    ['warning', 'alert-warning'],
    ['Warning', 'alert-warning'],
    ['WARNING', 'alert-warning'],
    ['success', 'alert-success'],
    ['Success', 'alert-success'],
    ['SUCCESS', 'alert-success'],
    ['normal', 'alert-info'],
    ['Normal', 'alert-info'],
    ['', 'alert-info'],
    [undefined, 'alert-info'],
  ];

  _.each(tc, _.spread(function(input, expected) {
    it('should result in ' + expected + ' when called with ' + input, function() {
      var actual = alertStatusFilter(input);
      expect(actual).toEqual(expected);
    });
  }));
});
