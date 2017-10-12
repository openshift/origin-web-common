describe("Filter: getErrorDetails", function() {
  'use strict';

  var getErrorDetailsFilter;

  beforeEach(inject(function (_getErrorDetailsFilter_) {
    getErrorDetailsFilter = _getErrorDetailsFilter_;
  }));

  var mockError = {
    data: {
      "kind": "Status",
      "apiVersion": "v1",
      "metadata": {},
      "status": "Failure",
      "message": "project.project.openshift.io \"openshift-project\" is forbidden: cannot request a project starting with \"openshift-\"",
      "reason": "Forbidden",
      "details": {
        "name": "openshift-project",
        "group": "project.openshift.io",
        "kind": "project"
      },
      "code": 403
    },
    status: 403
  };

  it('should return the error message', function() {
    var result = getErrorDetailsFilter(mockError);
    expect(result).toEqual(mockError.data.message);
  });

  it('should captilize the message when asked', function() {
    var result = getErrorDetailsFilter(mockError, true);
    expect(result).toEqual(_.upperFirst(mockError.data.message));
  });

  it('should return the status code if no message', function() {
    var error = angular.copy(mockError);
    delete error.data.message;
    var result = getErrorDetailsFilter(error);
    expect(result).toEqual('Status: 403');
  });

  it('should return the empty string if no message or status', function() {
    var result = getErrorDetailsFilter({});
    expect(result).toEqual('');
  });

  it('should return the empty string if no result', function() {
    var result = getErrorDetailsFilter();
    expect(result).toEqual('');
  });
});
