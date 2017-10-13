describe("Filter: imageForIconClass", function() {
  'use strict';

  var $window;
  var OPENSHIFT_CONSTANTS;
  var imageForIconClassFilter;

  beforeEach(function() {
    inject(function (_imageForIconClassFilter_, _$window_) {
      imageForIconClassFilter = _imageForIconClassFilter_;
      $window = _$window_;
    });

    OPENSHIFT_CONSTANTS = $window.OPENSHIFT_CONSTANTS;
  });

  afterEach(function () {
    // Restore original constants value.
    $window.OPENSHIFT_CONSTANTS = OPENSHIFT_CONSTANTS;
  });

  it('should find the image URL for the icon class', function() {
    _.set($window, 'OPENSHIFT_CONSTANTS.LOGO_BASE_URL', 'images/logos/');
    _.set($window, 'OPENSHIFT_CONSTANTS.LOGOS', {
      'icon_jenkins': 'icon_jenkins.svg'
    });
    var image = imageForIconClassFilter('icon_jenkins');
    expect(image).toEqual('images/logos/icon_jenkins.svg');
  });

  it('should find the image URL for the icon class with no base URL', function() {
    _.set($window, 'OPENSHIFT_CONSTANTS.LOGOS', {
      'icon_jenkins': 'icon_jenkins.svg'
    });
    delete $window.OPENSHIFT_CONSTANTS.LOGO_BASE_URL;
    var image = imageForIconClassFilter('icon_jenkins');
    expect(image).toEqual('icon_jenkins.svg');
  });

  it('should not prepend base URL to an absolute URL', function() {
    _.set($window, 'OPENSHIFT_CONSTANTS.LOGO_BASE_URL', 'images/logos/');
    _.set($window, 'OPENSHIFT_CONSTANTS.LOGOS', {
      'icon_jenkins': 'http://example.com/images/logos/icon_jenkins.svg'
    });
    var image = imageForIconClassFilter('icon_jenkins');
    expect(image).toEqual('http://example.com/images/logos/icon_jenkins.svg');
  });

  it('should return the empty string for unrecognized icon classes', function() {
    _.set($window, 'OPENSHIFT_CONSTANTS.LOGO_BASE_URL', 'images/logos/');
    _.set($window, 'OPENSHIFT_CONSTANTS.LOGOS', {
      'icon_jenkins': 'icon_jenkins.svg'
    });
    var image = imageForIconClassFilter('icon_unrecognized');
    expect(image).toEqual('');
  });

  it('should return the empty string for falsey values', function() {
    _.set($window, 'OPENSHIFT_CONSTANTS.LOGO_BASE_URL', 'images/logos/');
    _.set($window, 'OPENSHIFT_CONSTANTS.LOGOS', {
      'icon_jenkins': 'icon_jenkins.svg'
    });
    var image = imageForIconClassFilter('');
    expect(image).toEqual('');
    image = imageForIconClassFilter(null);
    expect(image).toEqual('');
    image = imageForIconClassFilter();
    expect(image).toEqual('');
  });

  it('should not fail if no OPENSHIFT_CONSTANTS', function() {
    delete $window.OPENSHIFT_CONSTANTS;
    var image = imageForIconClassFilter('icon_jenkins');
    expect(image).toEqual('');
  });
});
