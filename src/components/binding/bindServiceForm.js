'use strict';

angular.module('openshiftCommonUI').component('bindServiceForm', {
  controllerAs: 'ctrl',
  bindings: {
    serviceClass: '<',
    serviceClassName: '<',
    formName: '=',
    applications: '<',
    appToBind: '=',
    createBinding: '=?',
    allowNoBinding: '<?',
    shouldBindToApp: '=',
    groupByKind: '<'
  },
  templateUrl: 'src/components/binding/bindServiceForm.html',
  controller: function () {
    var ctrl = this;
  }
});
