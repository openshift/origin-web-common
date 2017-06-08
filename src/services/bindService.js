'use strict';

angular.module("openshiftCommonServices")
  .service("BindingService", function($filter, $q, DataService, DNS1123_SUBDOMAIN_VALIDATION){
    var bindingResource = {
      group: 'servicecatalog.k8s.io',
      resource: 'bindings'
    };

    var makeBinding = function (serviceToBind, appToBind) {
      var generateName = $filter('generateName');
      var relatedObjName = generateName(_.trunc(serviceToBind, DNS1123_SUBDOMAIN_VALIDATION.maxlength - 6) + '-');
      var binding = {
        kind: 'Binding',
        apiVersion: 'servicecatalog.k8s.io/v1alpha1',
        metadata: {
          generateName: serviceToBind + '-'
        },
        spec: {
          instanceRef: {
            name: serviceToBind
          },
          secretName: relatedObjName
        }
      };
      var appSelector = _.get(appToBind, 'spec.selector');
      if (appSelector) {
        if (!appSelector.matchLabels && !appSelector.matchExpressions) {
          // Then this is the old format of selector, pod preset requires the new format
          appSelector = {
            matchLabels: appSelector
          };
        }
        binding.spec.alphaPodPresetTemplate = {
          name: relatedObjName,
          selector: appSelector
        };
      }
      return binding;
    };

    return {
      bindingResource: bindingResource,
      bindService: function(context, serviceToBind, appToBind) {
        var newBinding = makeBinding(serviceToBind, appToBind);
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
