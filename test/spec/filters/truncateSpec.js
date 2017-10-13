describe("Filter: truncate", function() {
  'use strict';

  var $scope;
  var $filter;

  beforeEach(inject(function (_$rootScope_, _$filter_) {
    $scope = _$rootScope_;
    $filter = _$filter_;
  }));

  beforeEach(function () {
    $scope.params = {
      str: 'Operation cannot be fulfilled on namespaces\n"ups-broker": The system is ensuring all content is removed\nfrom this namespace. Upon completion, this\nnamespace will automatically be purged by the system.\n',
      charLimit: 200,
      useWordBoundary: false,
      newlineLimit: null
    };
  });

  it('should have a minimum of two parameters defined', function() {

    var str = null;
    var charLimit = null;
    var useWordBoundary = $scope.params.useWordBoundary;
    var newlineLimit = $scope.params.newlineLimit;
    var filteredString = $filter('truncate')(str, charLimit, useWordBoundary, newlineLimit);

    expect(str).toBeFalsy();
    expect(charLimit).toBeFalsy();
    expect(useWordBoundary).toEqual(false);
    expect(newlineLimit).toBeFalsy();

    expect(filteredString).toEqual(null);
  });

  it('should return a string with a specific length', function() {

    var str = $scope.params.str;
    var charLimit = $scope.params.charLimit;
    var useWordBoundary = $scope.params.useWordBoundary;
    var newlineLimit = $scope.params.newlineLimit;
    var filteredString = $filter('truncate')(str, charLimit, useWordBoundary, newlineLimit);

    expect(filteredString.length).toEqual(200);
  });

  it('should return a string that ends on a word boundary', function() {

    var str = $scope.params.str;
    var charLimit = $scope.params.charLimit;
    var useWordBoundary = true;
    var newlineLimit = $scope.params.newlineLimit;
    var filteredString = $filter('truncate')(str, charLimit, useWordBoundary, newlineLimit);

    expect(filteredString.length).toEqual(192);
    expect(/^\s/.test(str.split(filteredString)[1])).toEqual(true);
  });

  it('should return a string with a limited number of new lines', function() {

    var str = $scope.params.str;
    var charLimit = $scope.params.charLimit;
    var useWordBoundary = $scope.params.useWordBoundary;
    var newlineLimit = 1;
    var filteredString = $filter('truncate')(str, charLimit, useWordBoundary, newlineLimit);

    expect((filteredString.match(/\n/g)||[]).length).toEqual(0);

    newlineLimit = 2;
    filteredString = $filter('truncate')(str, charLimit, useWordBoundary, newlineLimit);
    expect((filteredString.match(/\n/g)||[]).length).toEqual(1);

    newlineLimit = 3;
    filteredString = $filter('truncate')(str, charLimit, useWordBoundary, newlineLimit);
    expect((filteredString.match(/\n/g)||[]).length).toEqual(2);

    newlineLimit = 4;
    filteredString = $filter('truncate')(str, charLimit, useWordBoundary, newlineLimit);
    expect((filteredString.match(/\n/g)||[]).length).toEqual(3);
  });

  it('should return a string that both ends on a word boundary, and has a limited number of new lines', function() {

    var str = $scope.params.str;
    var charLimit = $scope.params.charLimit;
    var useWordBoundary = true;
    var newlineLimit = 3;
    var filteredString = $filter('truncate')(str, charLimit, useWordBoundary, newlineLimit);

    expect(filteredString.length).toEqual(146);
    expect(/^\s/.test(str.split(filteredString)[1])).toEqual(true);
    expect((filteredString.match(/\n/g)||[]).length).toEqual(2);
  });

});
