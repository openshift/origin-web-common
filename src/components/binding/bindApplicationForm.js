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
  controller: function (BindingService) {
    var ctrl = this;
    ctrl.$onChanges = function (changeObj) {
      if (changeObj.serviceInstances || changeObj.serviceClasses) {
        ctrl.bindableServiceInstances = _.filter(ctrl.serviceInstances, isBindable);
      }
    };

    function isBindable(serviceInstance) {
      return BindingService.isServiceBindable(serviceInstance, ctrl.serviceClasses);
    }
  }
});
