describe("Filter: isNewerResource", function() {
  'use strict';

  var isNewerResourceFilter;

  beforeEach(inject(function (_isNewerResourceFilter_) {
    isNewerResourceFilter = _isNewerResourceFilter_;
  }));

  var olderDate = new Date('Wed, 14 Jun 2017 00:00:00 PDT').toISOString();
  var newerDate = new Date('Thu, 15 Jun 2017 00:00:00 PDT').toISOString();

  var mockObjectWithDate = function(dateString) {
    return {
      metadata: {
        creationTimestamp: dateString
      }
    };
  };

  it('should determine one resource is newer than another', function() {
    var older = mockObjectWithDate(olderDate);
    var newer = mockObjectWithDate(newerDate);

    var result = isNewerResourceFilter(newer, older);
    expect(result).toBe(true);

    // Reverse order of arguments.
    result = isNewerResourceFilter(older, newer);
    expect(result).toBe(false);
  });

  it('should return true when other date is undefined', function() {
    var result = isNewerResourceFilter(mockObjectWithDate(newerDate));
    expect(result).toBe(true);
  });

  it('should return false when candidate date is undefined', function() {
    var result = isNewerResourceFilter();
    expect(result).toBe(false);

    var older = mockObjectWithDate(olderDate);
    result = isNewerResourceFilter(undefined, older);
    expect(result).toBe(false);
  });

  it('should return false when dates are the same', function() {
    var left = mockObjectWithDate(olderDate);
    var right = mockObjectWithDate(olderDate);
    var result = isNewerResourceFilter(left, right);
    expect(result).toBe(false);
  });

  it('should handle missing creation timestamps', function() {
    var result = isNewerResourceFilter({}, {});
    expect(result).toBe(false);

    var newer = mockObjectWithDate(newerDate);
    result = isNewerResourceFilter(newer, {});
    expect(result).toBe(true);

    result = isNewerResourceFilter({}, newer);
    expect(result).toBe(false);
  });
});
