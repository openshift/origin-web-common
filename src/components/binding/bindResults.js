'use strict';

angular.module('openshiftCommonUI').component('bindResults', {
  controllerAs: 'ctrl',
  bindings: {
    error: '<',
    binding: '<',
    progressInline: '@',
    serviceToBind: '<',
    bindType: '@',
    applicationToBind: '<',
    showPodPresets: '<',
    secretHref: '<'
  },
  templateUrl: 'src/components/binding/bindResults.html',
  controller: function() {
    var ctrl = this;
    ctrl.$onInit = function () {
      ctrl.progressInline = ctrl.progressInline === 'true';
    };

    ctrl.$onChanges = function(onChangesObj) {
      if (onChangesObj.progressInline) {
        ctrl.progressInline = ctrl.progressInline === 'true';
      }
    }
  }
});


