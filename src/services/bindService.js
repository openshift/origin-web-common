'use strict';

angular.module("openshiftCommonServices")
  .service("BindingService",
           function($filter,
                    $q,
                    AuthService,
                    DataService,
                    DNS1123_SUBDOMAIN_VALIDATION) {
    var bindingResource = {
      group: 'servicecatalog.k8s.io',
      resource: 'bindings'
    };

    var getServiceClassForInstance = function(serviceInstance, serviceClasses) {
      var serviceClassName = _.get(serviceInstance, 'spec.serviceClassName');
      return _.get(serviceClasses, [serviceClassName]);
    };

    var getPlanForInstance = function(serviceInstance, serviceClass) {
      var planName = _.get(serviceInstance, 'spec.planName');
      return _.find(serviceClass.plans, { name: planName });
    };

    var getBindParameters = function(serviceInstance, serviceClass) {
      var plan = getPlanForInstance(serviceInstance, serviceClass);
      if (_.has(plan, ['alphaBindingCreateParameterSchema', 'properties', 'template.openshift.io/requester-username'])) {
        return AuthService.withUser().then(function(user) {
          return {
            'template.openshift.io/requester-username': user.metadata.name
          };
        });
      }

      return $q.when({});
    };

    var generateName = $filter('generateName');
    var makeBinding = function (serviceInstance, application, parameters) {
      var instanceName = serviceInstance.metadata.name;
      var relatedObjName = generateName(_.truncate(instanceName, DNS1123_SUBDOMAIN_VALIDATION.maxlength - 6) + '-');
      var binding = {
        kind: 'Binding',
        apiVersion: 'servicecatalog.k8s.io/v1alpha1',
        metadata: {
          generateName: instanceName + '-'
        },
        spec: {
          instanceRef: {
            name: instanceName
          },
          secretName: relatedObjName
        }
      };

      if (!_.isEmpty(parameters)) {
        binding.spec.parameters = parameters;
      }

      var appSelector = _.get(application, 'spec.selector');
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
      getServiceClassForInstance: getServiceClassForInstance,

      // Create a binding for `serviceInstance`. If an `application` API object
      // is specified, also create a pod preset for that application using its
      // `spec.selector`. `serviceClass` is required to determine if any
      // parameters need to be set when creating the binding.
      bindService: function(serviceInstance, application, serviceClass) {
        return getBindParameters(serviceInstance, serviceClass).then(function (parameters) {
          var newBinding = makeBinding(serviceInstance, application, parameters);
          var context = {
            namespace: serviceInstance.metadata.namespace
          };
          return DataService.create(bindingResource, null, newBinding, context);
        });
      },

      isServiceBindable: function(serviceInstance, serviceClasses) {
        var serviceClass = getServiceClassForInstance(serviceInstance, serviceClasses);
        if (!serviceClass) {
          return !!serviceInstance;
        }

        var plan = getPlanForInstance(serviceInstance, serviceClass);
        var planBindable = _.get(plan, 'bindable');
        if (planBindable === true) {
          return true;
        }
        if (planBindable === false) {
          return false;
        }

        // If `plan.bindable` is not set, fall back to `serviceClass.bindable`.
        return serviceClass.bindable;
      }
    };
  });
