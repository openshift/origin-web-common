describe("Filter: isAbsoluteURL", function() {
  'use strict';

  var isAbsoluteURLFilter;

  beforeEach(inject(function (_isAbsoluteURLFilter_) {
    isAbsoluteURLFilter = _isAbsoluteURLFilter_;
  }));

  it('should recognize an absolute URL with http protocol', function() {
    var isAbsolute = isAbsoluteURLFilter('http://www.example.com/console');
    expect(isAbsolute).toBe(true);
  });

  it('should recognize an absolute URL with https protocol', function() {
    var isAbsolute = isAbsoluteURLFilter('https://www.example.com/console');
    expect(isAbsolute).toBe(true);
  });

  it('should not consider a relative URL to be absolute', function() {
    var isAbsolute = isAbsoluteURLFilter('foo');
    expect(isAbsolute).toBe(false);

    isAbsolute = isAbsoluteURLFilter('foo/bar');
    expect(isAbsolute).toBe(false);

    isAbsolute = isAbsoluteURLFilter('foo/bar/baz?param=false#some-id');
    expect(isAbsolute).toBe(false);
  });

  it('should not consider non-HTTP URLs to be absolute', function() {
    var isAbsolute = isAbsoluteURLFilter('git@github.com:openshift/origin-web-console.git');
    expect(isAbsolute).toBe(false);

    isAbsolute = isAbsoluteURLFilter('ftp://ftp.example.com');
    expect(isAbsolute).toBe(false);
  });

  it('should not consider an empty string to be absolute', function() {
    var isAbsolute = isAbsoluteURLFilter('');
    expect(isAbsolute).toBe(false);
  });

  it('should not consider null or undefined to be absolute', function() {
    var isAbsolute = isAbsoluteURLFilter(null);
    expect(isAbsolute).toBe(false);

    isAbsolute = isAbsoluteURLFilter();
    expect(isAbsolute).toBe(false);
  });

  it('should not consider invalid types to be absolute', function() {
    var isAbsolute = isAbsoluteURLFilter(1);
    expect(isAbsolute).toBe(false);

    isAbsolute = isAbsoluteURLFilter(true);
    expect(isAbsolute).toBe(false);
  });
});
