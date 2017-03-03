"use strict";

describe("DataService", function(){
  var DataService;

  beforeEach(function(){
    inject(function(_DataService_){
      DataService = _DataService_;
    });
  });

  describe("#url", function(){

    var tc = [
      // Empty tests
      [null,           null],
      [{},             null],

      // Unknown resources
      [{resource:''},      null],
      [{resource:'bogus'}, null],

      // Kind is not allowed
      [{resource:'Pod'},  null],
      [{resource:'User'}, null],

      // resource normalization
      [{resource:'users'},             "http://localhost:8443/oapi/v1/users"],
      [{resource:'Users'},             "http://localhost:8443/oapi/v1/users"],
      [{resource:'oauthaccesstokens'}, "http://localhost:8443/oapi/v1/oauthaccesstokens"],
      [{resource:'OAuthAccessTokens'}, "http://localhost:8443/oapi/v1/oauthaccesstokens"],
      [{resource:'nodes'},              "http://localhost:8443/api/v1/nodes"],
      [{resource:'Nodes'},              "http://localhost:8443/api/v1/nodes"],

      // OpenShift resource
      [{resource:'clusterroles'                       }, "http://localhost:8443/oapi/v1/clusterroles"],
      [{resource:'builds', namespace:"foo"            }, "http://localhost:8443/oapi/v1/namespaces/foo/builds"],
      [{resource:'clusterroles',            name:"bar"}, "http://localhost:8443/oapi/v1/clusterroles/bar"],
      [{resource:'builds', namespace:"foo", name:"bar"}, "http://localhost:8443/oapi/v1/namespaces/foo/builds/bar"],

      // k8s resource
      [{resource:'nodes'                                              }, "http://localhost:8443/api/v1/nodes"],
      [{resource:'replicationcontrollers', namespace:"foo"            }, "http://localhost:8443/api/v1/namespaces/foo/replicationcontrollers"],
      [{resource:'nodes',                                   name:"bar"}, "http://localhost:8443/api/v1/nodes/bar"],
      [{resource:'replicationcontrollers', namespace:"foo", name:"bar"}, "http://localhost:8443/api/v1/namespaces/foo/replicationcontrollers/bar"],

      // Subresources and webhooks
      [{resource:'pods/proxy',                           name:"mypod:1123", namespace:"foo"}, "http://localhost:8443/api/v1/namespaces/foo/pods/mypod%3A1123/proxy"],
      [{resource:'builds/clone',                         name:"mybuild",    namespace:"foo"}, "http://localhost:8443/oapi/v1/namespaces/foo/builds/mybuild/clone"],
      [{resource:'buildconfigs/instantiate',             name:"mycfg",      namespace:"foo"}, "http://localhost:8443/oapi/v1/namespaces/foo/buildconfigs/mycfg/instantiate"],
      [{resource:'buildconfigs/webhooks/123/github',     name:"mycfg",      namespace:"foo"}, "http://localhost:8443/oapi/v1/namespaces/foo/buildconfigs/mycfg/webhooks/123/github"],
      [{resource:'buildconfigs/webhooks/123?234/github', name:"mycfg",      namespace:"foo"}, "http://localhost:8443/oapi/v1/namespaces/foo/buildconfigs/mycfg/webhooks/123%3F234/github"],
      // Subresources aren't lowercased
      [{resource:'buildconfigs/webhooks/Aa1/github',     name:"mycfg",      namespace:"foo"}, "http://localhost:8443/oapi/v1/namespaces/foo/buildconfigs/mycfg/webhooks/Aa1/github"],



      // Plain websocket
      [{resource:'pods', namespace:"foo", isWebsocket:true      }, "ws://localhost:8443/api/v1/namespaces/foo/pods"],

      // Watch resource
      [{resource:'pods', namespace:"foo", isWebsocket:true, watch: true                       }, "ws://localhost:8443/api/v1/namespaces/foo/pods?watch=true"],
      [{resource:'pods', namespace:"foo", isWebsocket:true, watch: true, resourceVersion:"5"  }, "ws://localhost:8443/api/v1/namespaces/foo/pods?watch=true&resourceVersion=5"],

      // Follow log
      // subresource is ignored without a resource name
      [{resource:'pods/log', namespace:"foo", isWebsocket:true, follow: true                       }, "ws://localhost:8443/api/v1/namespaces/foo/pods?follow=true"],
      [{resource:'builds/log', namespace:"foo", isWebsocket:true, follow: true                     }, "ws://localhost:8443/oapi/v1/namespaces/foo/builds?follow=true"],
      // subresource is honored with a resource name
      [{resource:'pods/log',   name:"p", namespace:"foo", isWebsocket:true, follow: true           }, "ws://localhost:8443/api/v1/namespaces/foo/pods/p/log?follow=true"],
      [{resource:'builds/log', name:"b", namespace:"foo", isWebsocket:true, follow: true           }, "ws://localhost:8443/oapi/v1/namespaces/foo/builds/b/log?follow=true"],



      // Namespaced subresource with params
      [{resource:'pods/proxy', name:"mypod", namespace:"myns", myparam1:"myvalue"}, "http://localhost:8443/api/v1/namespaces/myns/pods/mypod/proxy?myparam1=myvalue"],

      // Different API versions
      [{resource:'clusterroles',version:'v1beta3'}, null],
      [{resource:'clusterroles',version:'v1'     }, "http://localhost:8443/oapi/v1/clusterroles"],
      [{resource:'clusterroles',version:'unknown'}, null],

      [{resource:'nodes',  version:'v1beta3'}, null],
      [{resource:'nodes',  version:'v1'     }, "http://localhost:8443/api/v1/nodes"],
      [{resource:'nodes',  version:'unknown'}, null],

      // Different API groups
      [{resource:'jobs',  group: 'extensions', version:'v1beta1', namespace:"foo"}, "http://localhost:8443/apis/extensions/v1beta1/namespaces/foo/jobs"]
    ];

    angular.forEach(tc, function(item) {
      it('should generate a correct URL for ' + JSON.stringify(item[0]), function() {
        expect(DataService.url(item[0])).toEqual(item[1]);
      });
    });

  });

});
