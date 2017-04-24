'use strict';

angular.module('openshiftCommonUI')
  .filter("alertStatus", function() {
    return function (type) {
      var status;

      switch(type) {
        case 'error':
          status = 'alert-danger';
          break;
        case 'warning':
          status = 'alert-warning';
          break;
        case 'success':
          status = 'alert-success';
          break;
        default:
          status = 'alert-info';
      }

      return status;
    };
  })
  .filter('alertIcon', function() {
    return function (type) {
      var icon;

      switch(type) {
        case 'error':
          icon = 'pficon pficon-error-circle-o';
          break;
        case 'warning':
          icon = 'pficon pficon-warning-triangle-o';
          break;
        case 'success':
          icon = 'pficon pficon-ok';
          break;
        default:
          icon = 'pficon pficon-info';
      }

      return icon;
    };
  });
