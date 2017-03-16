'use strict';
/* jshint unused: false */

/**
 * @ngdoc function
 * @name openshifgCommonUI.controller:DeleteModalController
 */
angular.module('openshiftCommonUI')
  .controller('DeleteModalController', function ($scope, $uibModalInstance) {
    $scope.delete = function() {
      $uibModalInstance.close('delete');
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
