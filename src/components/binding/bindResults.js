'use strict';

angular.module('openshiftCommonUI').component('bindResults', {
  controllerAs: 'ctrl',
  bindings: {
    error: '<',
    binding: '<',
    serviceToBind: '<',
    bindType: '@',
    applicationToBind: '<',
    showPodPresets: '<',
    secretHref: '<'
  },
  templateUrl: 'src/components/binding/bindResults.html'
});
