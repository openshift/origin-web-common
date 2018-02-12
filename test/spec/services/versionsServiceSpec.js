describe('VersionsService', function() {
  'use strict';

  var VersionsService;
  beforeEach(function() {
    inject(function(_VersionsService_) {
      VersionsService = _VersionsService_;
    });
  });

  var versions = ["10.1", "9.1", "10.0", "9.0", "8.0", "10.1.1", "0.10", "latest", "old"];

  describe('#compare', function() {
    it('sort versions with lowest version first', function() {
      var result = angular.copy(versions).sort(VersionsService.compare);
      return expect(result).toEqual(["0.10", "8.0", "9.0", "9.1", "10.0", "10.1", "10.1.1", "latest", "old"]);
    });
  });

  describe('#rcompare', function() {
    it('sort versions with highest version first', function() {
      var result = angular.copy(versions).sort(VersionsService.rcompare);
      return expect(result).toEqual(["10.1.1", "10.1", "10.0", "9.1", "9.0", "8.0", "0.10", "latest", "old"]);
    });
  });
});
