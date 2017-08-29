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

    var isServiceBindable = function(serviceInstance, serviceClasses) {
      var serviceClass = getServiceClassForInstance(serviceInstance, serviceClasses);

      // If being deleted, it is not bindable
      if (_.get(serviceInstance, 'metadata.deletionTimestamp')) {
        return false;
      }

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
    };

    var getPodPresetSelectorsForBindings = function(bindings) {
      // Build a map of pod preset selectors by binding name.
      var podPresetSelectors = {};
      _.each(bindings, function(binding) {
        var podPresetSelector = _.get(binding, 'spec.alphaPodPresetTemplate.selector');
        if (podPresetSelector) {
          podPresetSelectors[binding.metadata.name] = new LabelSelector(podPresetSelector);
        }
      });

      return podPresetSelectors;
    };

    var getBindingsForResource = function(bindings, apiObject) {
      if (_.get(apiObject, 'kind') === 'Instance') {
        return _.filter(bindings, ['spec.instanceRef.name', _.get(apiObject, 'metadata.name')]);
      }

      var podPresetSelectors = getPodPresetSelectorsForBindings(bindings);

      // Create a selector for the potential binding target to check if the
      // pod preset covers the selector.
      var applicationSelector = new LabelSelector(_.get(apiObject, 'spec.selector'));

      var resourceBindings = [];

      // Look at each pod preset selector to see if it covers this API object selector.
      _.each(podPresetSelectors, function(podPresetSelector, bindingName) {
        if (podPresetSelector.covers(applicationSelector)) {
          // Keep a map of the target UID to the binding and the binding to
          // the target. We want to show bindings both in the "application"
          // object rows and the service instance rows.
          resourceBindings.push(bindings[bindingName]);
        }
      });

      return resourceBindings;
    };

    var filterBindableServiceInstances = function(serviceInstances, serviceClasses) {
      if (!serviceInstances && !serviceClasses) {
        return null;
      }

      return _.filter(serviceInstances, function (serviceInstance) {
        return isServiceBindable(serviceInstance, serviceClasses);
      });
    };

    var sortServiceInstances = function(serviceInstances, serviceClasses) {
      if (!serviceInstances && !serviceClasses) {
        return null;
      }

      return _.sortBy(serviceInstances,
        function(item) {
          return _.get(serviceClasses, [item.spec.serviceClassName, 'externalMetadata', 'displayName']) || item.spec.serviceClassName;
        },
        function(item) {
          return _.get(item, 'metadata.name', '');
        }
      );
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

      isServiceBindable: isServiceBindable,
      getPodPresetSelectorsForBindings: getPodPresetSelectorsForBindings,
      getBindingsForResource: getBindingsForResource,
      filterBindableServiceInstances: filterBindableServiceInstances,
      sortServiceInstances: sortServiceInstances
    };
  });
