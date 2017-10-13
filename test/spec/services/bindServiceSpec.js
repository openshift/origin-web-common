describe('BindingService', function() {
  'use strict';

  var BindingService, DNS1123_SUBDOMAIN_VALIDATION;
  beforeEach(function() {
    inject(function(_BindingService_, _DNS1123_SUBDOMAIN_VALIDATION_) {
      BindingService = _BindingService_;
      DNS1123_SUBDOMAIN_VALIDATION = _DNS1123_SUBDOMAIN_VALIDATION_;
    });
  });

  describe('#generateSecretName', function() {
    it('should generate a unique name for a secret given a prefix', function() {
      var prefix = 'mongodb-';
      var name1 = BindingService.generateSecretName(prefix);
      var name2 = BindingService.generateSecretName(prefix);
      expect(name1).not.toEqual(name2);
    });

    it('should generate a name that starts with a prefix', function() {
      var prefix = 'mongodb-';
      var name = BindingService.generateSecretName(prefix);
      expect(name.lastIndexOf(prefix)).toEqual(0);
    });

    it('should not generate a name that is too long', function() {
      var prefix = _.repeat('a', DNS1123_SUBDOMAIN_VALIDATION.maxlength);
      var name = BindingService.generateSecretName(prefix);
      expect(name.length).not.toBeGreaterThan(DNS1123_SUBDOMAIN_VALIDATION.maxlength);
    });

    it('should not generate duplicates for long names', function() {
      var prefix = _.repeat('a', DNS1123_SUBDOMAIN_VALIDATION.maxlength);
      var name1 = BindingService.generateSecretName(prefix);
      var name2 = BindingService.generateSecretName(prefix);
      expect(name1).not.toEqual(name2);
    });
  });

  describe('#makeParametersSecret', function() {
    var parameters = {
      parameter1: 'value1',
      parameter2: 'value2',
      parameter3: ['one', 'two', 'three'],
      parameter4: true,
      parameter5: {
        value: 1
      }
    };

    var owner = {
      apiVersion: "servicecatalog.k8s.io/v1beta1",
      kind: "ServceInstance",
      metadata: {
        name: "mariadb-persistent-6q4zn",
        namespace: "test",
        uid: "6a31b3ce-aec9-11e7-bae6-0242ac110002",
      },
      spec: {},
      status: {}
    };

    it('should create a secret with service catalog parameters JSON', function() {
      var secret = BindingService.makeParametersSecret('instance-params', parameters, owner);
      expect(secret.type).toEqual('Opaque');
      var json = secret.stringData.parameters;
      var actualParameters = JSON.parse(json);
      expect(actualParameters).toEqual(parameters);
    });

    it('should set an owner reference', function() {
      var secret = BindingService.makeParametersSecret('instance-params', parameters, owner);
      var ownerReferences = secret.metadata.ownerReferences;
      expect(ownerReferences.length).toEqual(1);
      var ownerRef = ownerReferences[0];
      expect(ownerRef.apiVersion).toEqual(owner.apiVersion);
      expect(ownerRef.kind).toEqual(owner.kind);
      expect(ownerRef.name).toEqual(owner.metadata.name);
      expect(ownerRef.uid).toEqual(owner.metadata.uid);
      expect(ownerRef.controller).toEqual(false);
      expect(ownerRef.blockOwnerDeletion).toEqual(false);
    });
  });

  describe('#isServiceBindable', function() {
    var mockServiceInstance = {
      metadata: {},
      spec: {},
      status: {
        conditions: []
      }
    };

    var mockServiceClass = {
      metadata: {},
      spec: {
        bindable: true
      }
    };

    var mockServicePlan = {
      metadata: {},
      spec: {
        bindable: true
      }
    };

    it('should allow binding a bindable service class', function() {
      var bindable = BindingService.isServiceBindable(mockServiceInstance, mockServiceClass, mockServicePlan);
      expect(bindable).toEqual(true);
    });

    it('should return false if service instance is undefined', function() {
      var bindable = BindingService.isServiceBindable(undefined, mockServiceClass, mockServicePlan);
      expect(bindable).toEqual(false);
    });

    it('should return false if service class is undefined', function() {
      var bindable = BindingService.isServiceBindable(mockServiceInstance, undefined, mockServicePlan);
      expect(bindable).toEqual(false);
    });

    it('should return false if service plan is undefined', function() {
      var bindable = BindingService.isServiceBindable(mockServiceInstance, mockServiceClass);
      expect(bindable).toEqual(false);
    });

    it('should return false if the instance is marked for deletion', function() {
      var serviceInstance = angular.copy(mockServiceInstance);
      serviceInstance.metadata.deletionTimestamp = "2017-10-11T21:17:16Z";
      var bindable = BindingService.isServiceBindable(serviceInstance, mockServiceClass, mockServicePlan);
      expect(bindable).toEqual(false);
    });

    it('should return false if the instance has failed', function() {
      var serviceInstance = angular.copy(mockServiceInstance);
      serviceInstance.status.conditions.push({
        type: 'Failed',
        status: 'True'
      });
      var bindable = BindingService.isServiceBindable(serviceInstance, mockServiceClass, mockServicePlan);
      expect(bindable).toEqual(false);
    });

    it('should return false if the plan is not bindable', function() {
      var plan = angular.copy(mockServicePlan);
      plan.spec.bindable = false;
      var bindable = BindingService.isServiceBindable(mockServiceInstance, mockServiceClass, plan);
      expect(bindable).toEqual(false);
    });

    it('should return true if the plan bindable is missing', function() {
      var plan = angular.copy(mockServicePlan);
      delete plan.spec.bindable;
      var bindable = BindingService.isServiceBindable(mockServiceInstance, mockServiceClass, plan);
      expect(bindable).toEqual(true);
    });

    it('should return true if the service class it not bindable, but plan is bindable', function() {
      var serviceClass = angular.copy(mockServiceClass);
      serviceClass.spec.bindable = false;
      var bindable = BindingService.isServiceBindable(mockServiceInstance, serviceClass, mockServicePlan);
      expect(bindable).toEqual(true);
    });
  });
});
