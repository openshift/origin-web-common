'use strict';
/* jshint unused: false */

/**
 * @ngdoc function
 * @name openshiftCommonUI.controller:DeleteProjectModalController
 */
angular.module('openshiftCommonUI')
  .controller('DeleteProjectModalController', function ($scope, $uibModalInstance) {
    $scope.delete = function() {
      $uibModalInstance.close('delete');
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
