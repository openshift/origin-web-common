'use strict';

angular.module("openshiftCommonServices")
  .service("BindingService", function($filter, $q, DataService, DNS1123_SUBDOMAIN_VALIDATION){
    var bindingResource = {
      group: 'servicecatalog.k8s.io',
      resource: 'bindings'
    };

    var makeBinding = function (serviceToBind) {
      var generateName = $filter('generateName');

      return {
        kind: 'Binding',
        apiVersion: 'servicecatalog.k8s.io/v1alpha1',
        metadata: {
          generateName: serviceToBind + '-'
        },
        spec: {
          instanceRef: {
            name: serviceToBind
          },
          secretName: generateName(_.trunc(serviceToBind, DNS1123_SUBDOMAIN_VALIDATION.maxlength - 6) + '-')
        }
      };
    };

    return {
      bindingResource: bindingResource,
      bindService: function(context, serviceToBind, appToBind) {
        var newBinding = makeBinding(serviceToBind);

        // TODO: Use appToBind to bind the service to the application
        return DataService.create(bindingResource, null, newBinding, context);
      },
      isServiceBindable: function(serviceInstance, serviceClasses) {
        if (serviceClasses && serviceInstance) {
          var serviceClass = serviceClasses[serviceInstance.spec.serviceClassName];
          if (serviceClass) {
            var plan = _.find(serviceClass.plans, {name: serviceInstance.spec.planName});
            if (plan.bindable === false) {
              return false;
            } else if (plan.bindable === true) {
              return true;
            } else {
              return serviceClass.bindable;
            }
          }
        }
        return !!serviceInstance;
      }
    };
  });
