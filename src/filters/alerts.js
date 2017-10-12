'use strict';

angular.module('openshiftCommonUI')
  .filter("alertStatus", function() {
    return function(type) {
      type = type || '';
      // API events have just two types: Normal, Warning
      // our notifications have four: info, success, error, and warning
      switch(type.toLowerCase()) {
        case 'error':
          return 'alert-danger';
        case 'warning':
          return 'alert-warning';
        case 'success':
          return 'alert-success';
        case 'normal':
          return 'alert-info';
      }

      return 'alert-info';
    };
  })
  .filter('alertIcon', function() {
    return function(type) {
      type = type || '';

      // API events have just two types: Normal, Warning
      // our notifications have four: info, success, error, and warning
      switch(type.toLowerCase()) {
        case 'error':
          return 'pficon pficon-error-circle-o';
        case 'warning':
          return 'pficon pficon-warning-triangle-o';
        case 'success':
          return 'pficon pficon-ok';
        case 'normal':
          return 'pficon pficon-info';
      }

      return 'pficon pficon-info';
    };
  });
