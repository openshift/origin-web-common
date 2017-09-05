'use strict';

angular.module('openshiftCommonUI')
  .filter("alertStatus", function() {
    return function (type) {
      var status;

      // API events have just two types: Normal, Warning
      // our notifications have four: info, success, error, and warning
      switch(type.toLowerCase()) {
        case 'error':
          status = 'alert-danger';
          break;
        case 'warning':
          status = 'alert-warning';
          break;
        case 'success':
          status = 'alert-success';
          break;
        case 'normal':
          status = 'alert-info';
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

      // API events have just two types: Normal, Warning
      // our notifications have four: info, success, error, and warning
      switch(type.toLowerCase()) {
        case 'error':
          icon = 'pficon pficon-error-circle-o';
          break;
        case 'warning':
          icon = 'pficon pficon-warning-triangle-o';
          break;
        case 'success':
          icon = 'pficon pficon-ok';
          break;
        case 'normal':
          icon = 'pficon pficon-info';
          break;
        default:
          icon = 'pficon pficon-info';
      }

      return icon;
    };
  });
