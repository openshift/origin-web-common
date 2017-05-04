'use strict';

angular.module('openshiftCommonUI').component('bindApplicationForm', {
  controllerAs: 'ctrl',
  bindings: {
    allowNoBinding: '<?',
    createBinding: '=',
    applicationName: '=',
    formName: '=',
    serviceClasses: '<',
    serviceInstances: '<',
    serviceToBind: '='
  },
  templateUrl: 'src/components/binding/bindApplicationForm.html',
  controller: function () {
    var ctrl = this;
  }
});
