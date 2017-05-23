describe("APIService", function() {
  var APIService;

  beforeEach(function(){
    inject(function(_APIService_) {
      APIService = _APIService_;
    });
  });

  describe("#toResourceGroupVersion", function() {

    var tc = [
      // string args
      // simple
      ['pods',         {r:'pods',g:'',v:'v1'}],
      // normalization
      ['Pods',         {r:'pods',g:'',v:'v1'}],
      // normalization preserves subresources
      ['PODS/FOO',     {r:'pods/FOO',g:'',v:'v1'}],

      // structured, resource only
      // simple
      [{resource:'pods'},         {r:'pods',g:'',v:'v1'}],
      // normalization
      [{resource:'Pods'},         {r:'pods',g:'',v:'v1'}],
      // normalization preserves subresources
      [{resource:'PODS/FOO'},     {r:'pods/FOO',g:'',v:'v1'}],

      // structured, with group
      // groups default version if known
      [{resource:'pods',group:''},           {r:'pods',g:'',          v:'v1'     }],
      [{resource:'jobs',group:'extensions'}, {r:'jobs',g:'extensions',v:'v1beta1'}],
      // unknown groups do not default version
      [{resource:'foos',group:'unknown'},    {r:'foos',g:'unknown',   v:undefined}],

      // structured, with version
      // groups default
      [{resource:'pods',version:'v1'},      {r:'pods',g:'',v:'v1'     }],
      [{resource:'pods',version:'v1beta3'}, {r:'pods',g:'',v:'v1beta3'}],

      // structured, fully specified
      [{resource:'pods',group:'',          version:'v1'},      {r:'pods',g:'',          v:'v1'     }],
      [{resource:'pods',group:'',          version:'v1beta3'}, {r:'pods',g:'',          v:'v1beta3'}],
      [{resource:'jobs',group:'extensions',version:'v1'},      {r:'jobs',g:'extensions',v:'v1'     }],
      [{resource:'jobs',group:'extensions',version:'v1beta1'}, {r:'jobs',g:'extensions',v:'v1beta1'}],
      [{resource:'foos',group:'unknown',   version:'v1'},      {r:'foos',g:'unknown',   v:'v1'     }],
      [{resource:'foos',group:'unknown',   version:'v1beta1'}, {r:'foos',g:'unknown',   v:'v1beta1'}]
    ];

    angular.forEach(tc, _.spread(function(input, expectedRGV) {
      it('should result in ' + JSON.stringify(expectedRGV) + ' when called with ' + JSON.stringify(input), function() {
        // Call once and compare the components
        var actualRGV = APIService.toResourceGroupVersion(input);
        expect(actualRGV.resource).toEqual(expectedRGV.r);
        expect(actualRGV.group   ).toEqual(expectedRGV.g);
        expect(actualRGV.version ).toEqual(expectedRGV.v);

        // Call again with the result and make sure it is returns the same thing
        var actualRGV2 = APIService.toResourceGroupVersion(actualRGV);
        expect(actualRGV).toEqual(actualRGV2);
      });
    }));

  });

  describe('#kindToResourceGroupVersion', function() {
    var kinds = [
      [{kind: 'ServiceAccount', group: ''}, {"resource":"serviceaccounts","group":"","version":"v1"}],
      [{kind: 'PodTemplate', group: ''}, {"resource":"podtemplates","group":"","version":"v1"}],
      [{kind: 'HorizontalPodAutoscaler', group: 'autoscaling'}, {"resource":"horizontalpodautoscalers","group":"autoscaling","version":"v1"}],
      [{kind: 'DaemonSet', group: 'extensions'}, {"resource":"daemonsets","group":"extensions","version":"v1beta1"}],
      [{kind: 'RoleBinding', group: 'rbac.authorization.k8s.io'}, {"resource":"rolebindings","group":"rbac.authorization.k8s.io","version":"v1beta1"}],
      [{kind: 'PodPreset', group: 'settings.k8s.io'}, {"resource":"podpresets","group":"settings.k8s.io","version":"v1alpha1"}],
      [{kind: 'Policy', group: 'authorization.openshift.io'}, {"resource":"policies","group":"authorization.openshift.io","version":"v1"}],
      [{kind: 'Template', group: 'template.openshift.io'}, {"resource":"templates","group":"template.openshift.io","version":"v1"}],
      [{kind: 'NetworkPolicy', group: 'extensions'}, {"resource":"networkpolicies","group":"extensions","version":"v1beta1"}],
      [{kind: 'EgressNetworkPolicy', group: 'network.openshift.io'}, {"resource":"egressnetworkpolicies","group":"network.openshift.io","version":"v1"}],
      [{kind: 'LocalResourceAccessReview', group: 'authorization.openshift.io'}, {"resource":"localresourceaccessreviews","group":"authorization.openshift.io","version":"v1"}],
      [{kind: 'SelfSubjectRulesReview', group: 'authorization.openshift.io'}, {"resource":"selfsubjectrulesreviews","group":"authorization.openshift.io","version":"v1"}],
      [{kind: 'ReplicationControllerDummy', group: 'extensions'}, {"resource":"replicationcontrollerdummies","group":"extensions","version":"v1beta1"}]
    ];
    _.each(kinds, _.spread(function(kind, expectedRGV) {
      it('should result in ' + JSON.stringify(expectedRGV) + ' when called with ' + JSON.stringify(kind), function() {
        var actualRGV = APIService.kindToResourceGroupVersion(kind);
        expect(expectedRGV.resource).toEqual(actualRGV.resource);
        expect(expectedRGV.group).toEqual(actualRGV.group);
        expect(expectedRGV.version).toEqual(actualRGV.version);
      });
    }));
  });


  describe('#apiInfo', function() {
    var rgvs = [
      [
        {"resource":"serviceaccounts","group":"","version":"v1"},
        {resource: 'serviceaccounts', version: 'v1', hostPort: 'localhost:8443', prefix: '/api', namespaced: true, verbs: ['create', 'delete', 'deletecollection', 'get', 'list', 'patch', 'update', 'watch']}
      ],
      [
        {"resource":"horizontalpodautoscalers","group":"autoscaling","version":"v1"},
        {resource: 'horizontalpodautoscalers', group: 'autoscaling', version: 'v1', protocol: undefined, hostPort: 'localhost:8443', prefix: '/apis', namespaced: true, verbs: ['create', 'delete', 'deletecollection', 'get', 'list', 'patch', 'update', 'watch']}
      ],
      [
        {"resource":"templates","group":"template.openshift.io","version":"v1"},
        {resource: 'templates', group: 'template.openshift.io', version: 'v1', protocol: undefined, hostPort: 'localhost:8443', prefix: '/apis', namespaced: true, verbs: ['create', 'delete', 'deletecollection', 'get', 'list', 'patch', 'update', 'watch']}
      ],
      [
        {"resource":"policies","group":"authorization.openshift.io","version":"v1"},
        {resource: 'policies', group: 'authorization.openshift.io', version: 'v1', protocol: undefined, hostPort: 'localhost:8443', prefix: '/apis', namespaced: true, verbs: ['create', 'delete', 'deletecollection', 'get', 'list', 'patch', 'update', 'watch']}
      ],
      [
        {"resource":"selfsubjectrulesreviews","group":"authorization.openshift.io","version":"v1"},
        {resource: 'selfsubjectrulesreviews', group: 'authorization.openshift.io', version: 'v1', protocol: undefined, hostPort: 'localhost:8443', prefix: '/apis', namespaced: true, verbs: ['create']}
      ],
      [
        {"resource":"replicationcontrollerdummies","group":"extensions","version":"v1beta1"},
        undefined
      ]
    ];
    _.each(rgvs, _.spread(function(rgv, expectedAPIInfo) {
      it('should result in ' + JSON.stringify(expectedAPIInfo) + ' when called with ' + JSON.stringify(rgv), function() {
        var actualAPIInfo = APIService.apiInfo(rgv);
        if(actualAPIInfo) {
          expect(actualAPIInfo.resource).toEqual(expectedAPIInfo.resource);
          expect(actualAPIInfo.group).toEqual(expectedAPIInfo.group);
          expect(actualAPIInfo.version).toEqual(expectedAPIInfo.version);
          expect(actualAPIInfo.hostPort).toEqual(expectedAPIInfo.hostPort);
          expect(actualAPIInfo.prefix).toEqual(expectedAPIInfo.prefix);
          expect(actualAPIInfo.namespaced).toEqual(expectedAPIInfo.namespaced);
          expect(actualAPIInfo.verbs).toEqual(expectedAPIInfo.verbs);
        } else {
          expect(actualAPIInfo).toEqual(expectedAPIInfo);
        }
      });
    }));
  });

  describe("#parseGroupVersion", function(){
    var tc = [
      // invalid cases
      [null,          undefined],
      ["",            undefined],
      ['foo/bar/baz', undefined],
      // legacy
      ['v1',      {group:'',version:'v1'     }],
      // groups
      ['foo/bar',      {group:'foo',version:'bar'}],
      ['FOO/BAR',      {group:'FOO',version:'BAR'}],
      // group missing version, we see this on events
      ['apps', {group:'apps',version:''}],
    ];
    angular.forEach(tc, _.spread(function(input, expectedGroupVersion) {
      it('should result in ' + JSON.stringify(expectedGroupVersion) + ' when called with ' + JSON.stringify(input), function() {
        expect(APIService.parseGroupVersion(input)).toEqual(expectedGroupVersion);
      });
    }));
  });

  describe("#objectToResourceGroupVersion", function(){
    var tc = [
      // invalid cases
      [null,              undefined],
      ["",                undefined],
      [{},                undefined],
      [{kind:"Pod"},      undefined],
      [{apiVersion:"v1"}, undefined],

      // legacy
      [{kind:"Pod",      apiVersion:"v1"}, {g:'',v:'v1',r:'pods'}],

      // extensions
      [{kind:"Job",apiVersion:"extensions/v1beta1"}, {g:'extensions',v:'v1beta1',r:'jobs'}],
      [{kind:"Foo",apiVersion:"unknown/v1beta6"},    {g:'unknown',   v:'v1beta6',r:'foos'}],
    ];
    angular.forEach(tc, _.spread(function(input, expectedRGV) {
      it('should result in ' + JSON.stringify(expectedRGV) + ' when called with ' + JSON.stringify(input), function() {
        // Call once and compare the components
        var actualRGV = APIService.objectToResourceGroupVersion(input);
        if (expectedRGV) {
          expect(actualRGV.resource).toEqual(expectedRGV.r);
          expect(actualRGV.group   ).toEqual(expectedRGV.g);
          expect(actualRGV.version ).toEqual(expectedRGV.v);
        } else {
          expect(actualRGV).toEqual(expectedRGV);
        }
      });
    }));
  });

  describe("#kindToResource", function(){
    var tc = [
      // invalid cases
      [null,              ""],
      ["",                ""],

      // pluralization
      ["foo",             "foos"],
      // pluralization with s
      ["foos",            "fooses"],
      // pluralization with y
      ["Policy",          "policies"],
      // special cases
      ["Endpoints",                  "endpoints"],
      ["SecurityContextConstraints", "securitycontextconstraints"],
    ];
    angular.forEach(tc, _.spread(function(kind, resource) {
      it('should result in ' + JSON.stringify(resource) + ' when called with ' + JSON.stringify(kind), function() {
        expect(APIService.kindToResource(kind)).toEqual(resource);
      });
    }));
  });

  describe("#deriveTargetResource", function(){
    var tc = [
      // invalid cases
      [null,null,              undefined],
      ["","",                  undefined],
      [{},{},                  undefined],

      // simple resource, matching object overrides group/version
      ['pods', {kind:"Pod",apiVersion:"v1"},                 {r:'pods',g:'',          v:'v1'     }],
      ['pods', {kind:"Pod",apiVersion:"extensions"},         {r:'pods',g:'extensions',v:''       }],
      ['jobs', {kind:"Job",apiVersion:"extensions/v1beta1"}, {r:'jobs',g:'extensions',v:'v1beta1'}],
      ['jobs', {kind:"Job",apiVersion:"extensions/v1beta2"}, {r:'jobs',g:'extensions',v:'v1beta2'}],

      // simple resource, non-matching object leaves group/version alone
      ['pods', {kind:"Foo",apiVersion:"v1"},                 {r:'pods',g:'',v:'v1'}],
      ['pods', {kind:"Foo",apiVersion:"v2"},                 {r:'pods',g:'',v:'v1'}],
      ['jobs', {kind:"Foo",apiVersion:"extensions/v1beta1"}, {r:'jobs',g:'',v:'v1'}],
      ['jobs', {kind:"Foo",apiVersion:"extensions/v1beta2"}, {r:'jobs',g:'',v:'v1'}],
      // actual use:
      ['deploymentconfigs/scale', {kind:"Scale",apiVersion:"extensions/v1beta1"}, {r:'deploymentconfigs/scale',g:'',v:'v1'}],

      // complex resource, matching object kind and group overrides version
      [{resource:'pods',group:''                        }, {kind:"Pod",apiVersion:"v1"},                 {r:'pods',g:'',          v:'v1'     }],
      [{resource:'pods',group:'',           version:'v2'}, {kind:"Pod",apiVersion:"v1"},                 {r:'pods',g:'',          v:'v1'     }],
      [{resource:'jobs',group:'extensions'              }, {kind:"Job",apiVersion:"extensions/v1beta3"}, {r:'jobs',g:'extensions',v:'v1beta3'}],
      [{resource:'jobs',group:'extensions', version:'v2'}, {kind:"Job",apiVersion:"extensions/v1beta3"}, {r:'jobs',g:'extensions',v:'v1beta3'}],

      // complex resource, non-matching object group leaves group/version alone
      [{resource:'pods',                                }, {kind:"Pod",apiVersion:"othergroup/v3"},      {r:'pods',g:'',          v:'v1'     }],
      [{resource:'pods',group:''                        }, {kind:"Pod",apiVersion:"othergroup/v3"},      {r:'pods',g:'',          v:'v1'     }],
      [{resource:'pods',group:'',           version:'v2'}, {kind:"Pod",apiVersion:"othergroup/v3"},      {r:'pods',g:'',          v:'v2'     }],
      [{resource:'jobs',group:'extensions'              }, {kind:"Job",apiVersion:"othergroup/v1beta3"}, {r:'jobs',g:'extensions',v:'v1beta1'}],
      [{resource:'jobs',group:'extensions', version:'v2'}, {kind:"Job",apiVersion:"othergroup/v1beta3"}, {r:'jobs',g:'extensions',v:'v2'     }],
      // complex resource, non-matching object kind leaves group/version alone
      [{resource:'pods',group:''                        }, {kind:"Foo",apiVersion:"v3"},                 {r:'pods',g:'',          v:'v1'     }],
      [{resource:'pods',group:'',           version:'v2'}, {kind:"Foo",apiVersion:"v3"},                 {r:'pods',g:'',          v:'v2'     }],
      // actual use:
      [{resource:'deploymentconfigs/scale'},               {kind:"Scale",apiVersion:"extensions/v1beta1"}, {r:'deploymentconfigs/scale',g:'',v:'v1'}],
    ];
    angular.forEach(tc, _.spread(function(resource, apiObject, expectedRGV) {
      it('should result in ' + JSON.stringify(expectedRGV) + ' when called with ' + JSON.stringify(resource)+","+JSON.stringify(apiObject), function() {
        // Call once and compare the components
        var actualRGV = APIService.deriveTargetResource(resource, apiObject);
        if (expectedRGV) {
          expect(actualRGV.resource).toEqual(expectedRGV.r);
          expect(actualRGV.group   ).toEqual(expectedRGV.g);
          expect(actualRGV.version ).toEqual(expectedRGV.v);
        } else {
          expect(actualRGV).toEqual(expectedRGV);
        }
      });
    }));
  });

  describe("#primaryResource", function(){
    var tc = [
      // invalid cases
      [null,              ""],
      ["",                ""],

      // no subresources
      ["foo",             "foo"],
      ["FOO",             "foo"],

      // subresource cases
      ["foo/bar",         "foo"],
      ["FOO/bar/baz",     "foo"]
    ];
    angular.forEach(tc, _.spread(function(resource, primaryResource) {
      it('should result in ' + JSON.stringify(primaryResource) + ' when called with ' + JSON.stringify(resource), function() {
        expect(APIService.toResourceGroupVersion(resource).primaryResource()).toEqual(primaryResource);
      });
    }));
  });

  describe("#subresources", function(){
    var tc = [
      // invalid cases
      [null,              []],
      ["",                []],

      // no subresources
      ["foo",             []],
      ["FOO",             []],

      // subresource cases
      ["foo/bar",         ["bar"]],
      ["FOO/bar/baz",     ["bar","baz"]],
      ["FOO/Bar/Baz",     ["Bar","Baz"]]
    ];
    angular.forEach(tc, _.spread(function(resource, subresources) {
      it('should result in ' + JSON.stringify(subresources) + ' when called with ' + JSON.stringify(resource), function() {
        expect(APIService.toResourceGroupVersion(resource).subresources()).toEqual(subresources);
      });
    }));
  });


  describe('#availableKinds', function() {
    var bothSample = ['Binding','ConfigMap','DeploymentConfig','Event','LimitRange','Pod','ReplicaSet','Role','Service', 'Template'];
    var onlyClusterSample = ['ClusterResourceQuota','Namespace','OAuthAccessToken','PersistentVolume','ProjectRequest','User'];

    it('should return list of kinds that are scoped to a namespace by default', function() {
      var namespacedKinds = _.map(APIService.availableKinds(), 'kind');
      expect( _.difference(bothSample, namespacedKinds).length ).toEqual(0);
    });

    it('should not return list cluster scoped kinds by default', function() {
      var namespacedKinds = _.map(APIService.availableKinds(), 'kind');
      expect( _.difference(onlyClusterSample, namespacedKinds).length ).toEqual(onlyClusterSample.length);
    });

    it('should return list of all kinds, including those that are cluster scoped, when passed a truthy argument', function() {
      var allKinds = _.map(APIService.availableKinds(true), 'kind');
      expect( _.difference(bothSample, allKinds).length ).toEqual(0);
      expect( _.difference(onlyClusterSample, allKinds).length ).toEqual(0);
    });

    // kinds from the old /oapi should not be iterated at all.
    it('should not list kinds from the old /oapi namespace (that do not have a group)', function() {
      var allKinds = APIService.availableKinds(true);
      var shouldNotBeFound = [];
      // This is a sampling of items from /oapi that should no longer be listed
      var oapiShouldNotExistSample = [
        {kind: 'ClusterPolicy'},
        {kind: 'ClusterRole'},
        {kind: 'Image'},
        {kind: 'Template'},
        {kind: 'Project'},
        {kind: 'User'}
      ];
      _.each(oapiShouldNotExistSample, function(kindToFind) {
        var found = _.find(allKinds, function(kind) {
          return (kind.kind === kindToFind.kind) && !_.includes(_.keys(kind), 'group');
        });
        if(found) {
          shouldNotBeFound.push(found);
        }
      });
      expect(shouldNotBeFound.length).toEqual(0);
    });

    // unlike the /oapi endpoint, the /api endpoint should still be listed
    it('should list items from the k8s /api namespace where group is an empty string', function() {
      var allKinds = APIService.availableKinds(true);
      var shouldBeFound = [];
      // this is a sampling of items from /api that should still be listed,
      // even though they do not yet have a group associated.
      var k8sAPIStillExistsSample = [
        {kind: 'Binding'},
        {kind: 'ConfigMap'},
        {kind: 'Namespace'},
        {kind: 'PersistentVolume'},
        {kind: 'Service'},
        {kind: 'ServiceAccount'},
        {kind: 'Pod'}
      ];
      _.each(k8sAPIStillExistsSample, function(kindToFind) {
        var found = _.find(allKinds, function(kind) {
          return (kind.kind === kindToFind.kind) && kind.group === '';
        });
        if(found) {
          shouldBeFound.push(found);
        }
      });
      expect(shouldBeFound.length).toEqual(k8sAPIStillExistsSample.length);
    });

    it('should not return kinds from the AVAILABLE_KINDS_BLACKLIST', function() {
      var allKinds = APIService.availableKinds(true);
      // calculateAvailableKinds will transform strings form AVAILABLE_KINDS_BLACKLIST
      // into objects in this same way.
      var blacklist = _.map(window.OPENSHIFT_CONSTANTS.AVAILABLE_KINDS_BLACKLIST, function(kind) {
        return _.isString(kind) ?
                { kind: kind, group: '' } :
                kind;
      });

      _.each(blacklist, function(blacklistedKind) {
        expect(_.find(allKinds, blacklistedKind)).toEqual(undefined);
      });
    });

  });

});
