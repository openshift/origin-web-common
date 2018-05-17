'use strict';

angular.module("openshiftCommonServices")
  .service("BindingService",
           function($filter,
                    $q,
                    APIService,
                    AuthService,
                    DataService,
                    DNS1123_SUBDOMAIN_VALIDATION) {
    // The secret key this service uses for the parameters JSON blob when binding.
    var PARAMETERS_SECRET_KEY = 'parameters';

    var serviceBindingsVersion = APIService.getPreferredVersion('servicebindings');
    var secretsVersion = APIService.getPreferredVersion('secrets');

    var getServiceClassForInstance = function(serviceInstance, serviceClasses) {
      if (!serviceClasses) {
        return null;
      }

      var serviceClassName = _.get(serviceInstance, 'spec.clusterServiceClassRef.name');
      if (!serviceClassName) {
        return null;
      }

      return serviceClasses[serviceClassName];
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

    var makeParametersSecret = function(secretName, parameters, owner) {
      var secret = {
        apiVersion: 'v1',
        kind: 'Secret',
        metadata: {
          name: secretName,
          ownerReferences: [{
            apiVersion: owner.apiVersion,
            kind: owner.kind,
            name: owner.metadata.name,
            uid: owner.metadata.uid,
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

    var makeBinding = function(serviceInstance, application, parametersSecretName, metadata) {
      var instanceName = serviceInstance.metadata.name;

      metadata = _.assign({ generateName: instanceName + '-' }, metadata);
      var credentialSecretName = generateSecretName(serviceInstance.metadata.name + '-credentials-');
      var binding = {
        kind: 'ServiceBinding',
        apiVersion: 'servicecatalog.k8s.io/v1beta1',
        metadata: metadata,
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

    var isServiceBindable = function(serviceInstance, serviceClass, servicePlan) {
      if (!serviceInstance || !serviceClass || !servicePlan) {
        return false;
      }

      // If being deleted, it is not bindable
      if (_.get(serviceInstance, 'metadata.deletionTimestamp')) {
        return false;
      }

      // If provisioning failed, the service is not bindable
      if ($filter('isServiceInstanceFailed')(serviceInstance, 'Failed')) {
        return false;
      }

      var planBindable = _.get(servicePlan, 'spec.bindable');
      if (planBindable === true) {
        return true;
      }
      if (planBindable === false) {
        return false;
      }

      // If `plan.spec.bindable` is not set, fall back to `serviceClass.spec.bindable`.
      return serviceClass.spec.bindable;
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

    var filterBindableServiceInstances = function(serviceInstances, serviceClasses, servicePlans) {
      if (!serviceInstances || !serviceClasses || !servicePlans) {
        return null;
      }

      return _.filter(serviceInstances, function (serviceInstance) {
        var serviceClassName = _.get(serviceInstance, 'spec.clusterServiceClassRef.name');
        var servicePlanName = _.get(serviceInstance, 'spec.clusterServicePlanRef.name');
        return isServiceBindable(serviceInstance, serviceClasses[serviceClassName], servicePlans[servicePlanName]);
      });
    };

    var sortServiceInstances = function(serviceInstances, serviceClasses) {
      var getServiceClassDisplayName = function(serviceInstance) {
        var serviceClassName = _.get(serviceInstance, 'spec.clusterServiceClassRef.name');
        return _.get(serviceClasses, [serviceClassName, 'spec', 'externalMetadata', 'displayName']) || serviceInstance.spec.clusterServiceClassExternalName;
      };

      return _.sortBy(serviceInstances, [ getServiceClassDisplayName, 'metadata.name' ]);
    };

    return {
      bindingResource: serviceBindingsVersion,
      getServiceClassForInstance: getServiceClassForInstance,
      makeParametersSecret: makeParametersSecret,
      generateSecretName: generateSecretName,

      // Create a binding for `serviceInstance`. If an `application` API object
      // is specified, also create a pod preset for that application using its
      // `spec.selector`. `serviceClass` is required to determine if any
      // parameters need to be set when creating the binding.
      bindService: function(serviceInstance, application, serviceClass, parameters, metadata) {
        var parametersSecretName;
        if (!_.isEmpty(parameters)) {
          parametersSecretName = generateSecretName(serviceInstance.metadata.name + '-bind-parameters-');
        }

        var newBinding = makeBinding(serviceInstance, application, parametersSecretName, metadata);
        var context = {
          namespace: serviceInstance.metadata.namespace
        };

        var promise = DataService.create(serviceBindingsVersion, null, newBinding, context);
        if (!parametersSecretName) {
          return promise;
        }

        // Create the secret as well if the binding has parameters.
        return promise.then(function(binding) {
          var parametersSecret = makeParametersSecret(parametersSecretName, parameters, binding);
          return DataService.create(secretsVersion, null, parametersSecret, context).then(function() {
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
