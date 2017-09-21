'use strict';

angular.module("openshiftCommonServices")
  .service("BindingService",
           function($filter,
                    $q,
                    AuthService,
                    DataService,
                    DNS1123_SUBDOMAIN_VALIDATION) {
    // The secret key this service uses for the parameters JSON blob when binding.
    var PARAMETERS_SECRET_KEY = 'parameters';

    var bindingResource = {
      group: 'servicecatalog.k8s.io',
      resource: 'serviceinstancecredentials'
    };

    var getServiceClassForInstance = function(serviceInstance, serviceClasses) {
      var serviceClassName = _.get(serviceInstance, 'spec.serviceClassName');
      return _.get(serviceClasses, [serviceClassName]);
    };

    var getPlanForInstance = function(serviceInstance, serviceClass) {
      var planName = _.get(serviceInstance, 'spec.planName');
      return _.find(serviceClass.plans, { name: planName });
    };

    var generateName = $filter('generateName');
    var generateSecretName = function(prefix) {
      var generateNameLength = 5;
      // Truncate the class name if it's too long to append the generated name suffix.
      var secretNamePrefix = _.truncate(prefix, {
        // `generateNameLength - 1` because we append a '-' and then a 5 char generated suffix
        length: DNS1123_SUBDOMAIN_VALIDATION.maxlength - generateNameLength - 1,
        omission: ''
      });

      return generateName(secretNamePrefix, generateNameLength);
    };

    var makeParametersSecret = function(secretName, parameters, binding) {
      var secret = {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: secretName,
          ownerReferences: [{
            apiVersion: binding.apiVersion,
            kind: binding.kind,
            name: binding.metadata.name,
            uid: binding.metadata.uid,
            controller: false,
            // TODO: Change to true when garbage collection works with service
            // catalog resources. Setting to true now results in a 403 Forbidden
            // error creating the secret.
            blockOwnerDeletion: false
          }]
        },
        type: 'Opaque',
        stringData: {}
      };

      secret.stringData[PARAMETERS_SECRET_KEY] = JSON.stringify(parameters);
      return secret;
    };

    var makeBinding = function(serviceInstance, application, parametersSecretName) {
      var parametersSecretName;
      var instanceName = serviceInstance.metadata.name;

      var credentialSecretName = generateSecretName(serviceInstance.metadata.name + '-credentials-');
      var binding = {
        kind: 'ServiceInstanceCredential',
        apiVersion: 'servicecatalog.k8s.io/v1alpha1',
        metadata: {
          generateName: instanceName + '-'
        },
        spec: {
          instanceRef: {
            name: instanceName
          },
          secretName: credentialSecretName
        }
      };

      if (parametersSecretName) {
        binding.spec.parametersFrom = [{
          secretKeyRef: {
            name: parametersSecretName,
            key: PARAMETERS_SECRET_KEY
          }
        }];
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
          name: credentialSecretName,
          selector: appSelector
        };
      }

      return binding;
    };

    var isServiceBindable = function(serviceInstance, serviceClasses) {
      // If being deleted, it is not bindable
      if (_.get(serviceInstance, 'metadata.deletionTimestamp')) {
        return false;
      }

      // If provisioning failed, the service is not bindable
      if ($filter('isServiceInstanceFailed')(serviceInstance, 'Failed')) {
        return false;
      }

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
      if (_.get(apiObject, 'kind') === 'ServiceInstance') {
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
      getPlanForInstance: getPlanForInstance,

      // Create a binding for `serviceInstance`. If an `application` API object
      // is specified, also create a pod preset for that application using its
      // `spec.selector`. `serviceClass` is required to determine if any
      // parameters need to be set when creating the binding.
      bindService: function(serviceInstance, application, serviceClass, parameters) {
        var parametersSecretName;
        if (!_.isEmpty(parameters)) {
          parametersSecretName = generateSecretName(serviceInstance.metadata.name + '-bind-parameters-');
        }

        var newBinding = makeBinding(serviceInstance, application, parametersSecretName);
        var context = {
          namespace: serviceInstance.metadata.namespace
        };

        var promise = DataService.create(bindingResource, null, newBinding, context);
        if (!parametersSecretName) {
          return promise;
        }

        // Create the secret as well if the binding has parameters.
        return promise.then(function(binding) {
          var parametersSecret = makeParametersSecret(parametersSecretName, parameters, binding);
          return DataService.create("secrets", null, parametersSecret, context).then(function() {
            return binding;
          });
        });
      },

      isServiceBindable: isServiceBindable,
      getPodPresetSelectorsForBindings: getPodPresetSelectorsForBindings,
      getBindingsForResource: getBindingsForResource,
      filterBindableServiceInstances: filterBindableServiceInstances,
      sortServiceInstances: sortServiceInstances
    };
  });
