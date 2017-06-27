'use strict';

angular.module('openshiftCommonUI').component('bindServiceForm', {
  controllerAs: 'ctrl',
  bindings: {
    serviceClass: '<',
    serviceClassName: '<',
    applications: '<',
    formName: '=',
    allowNoBinding: '<?',
    projectName: '<',
    bindType: '=', // One of: 'none', 'application', 'secret-only'
    appToBind: '=' // only applicable to 'application' bindType
  },
  templateUrl: 'src/components/binding/bindServiceForm.html',
  controller: function ($filter) {
    var ctrl = this;

    var humanizeKind = $filter('humanizeKind');
    ctrl.groupByKind = function(object) {
      return humanizeKind(object.kind);
    };
  }
});
