'use strict';

angular.module('openshiftCommonServices')
  .constant('API_PREFERRED_VERSIONS', {
      autoscaling:                  {group: 'autoscaling',            resource: 'horizontalpodautoscalers' },
      appliedclusterresourcequotas: {group: 'quota.openshift.io',     resource: 'appliedclusterresourcequotas' },
      bindings:                     {group: 'servicecatalog.k8s.io',  resource: 'bindings' },
      builds:                       {group: 'build.openshift.io',     resource: 'builds' },
      buildconfigs:                 {group: 'build.openshift.io',     resource: 'buildconfigs' },
      configmaps:                   'configmaps',
      deployments:                  {group: 'apps',                   resource: 'deployments' },
      deploymentconfigs:            {group: 'apps.openshift.io',      resource: 'deploymentconfigs' },
      imagestreams:                 {group: 'image.openshift.io',     resource: 'imagestreams' },
      imagestreamtags:              {group: 'image.openshift.io',     resource: 'imagestreamtags' },
      instances:                    {group: 'servicecatalog.k8s.io',  resource: 'instances' },
      limitranges:                  'limitranges',
      pods:                         'pods',
      projects:                     {group: 'project.openshift.io',   resource: 'projects'},
      projectrequests:              {group: 'project.openshift.io',   resource: 'projectrequests'},
      persistentvolumeclaims:       'persistentvolumeclaims',
      replicasets:                  {group: 'extensions',             resource: 'replicasets' },
      replicationcontrollers:       'replicationcontrollers',
      resourcequotas:               'resourcequotas',
      rolebindings:                 'rolebindings',
      routes:                       {group: 'route.openshift.io',     resource: 'routes' },
      secrets:                      'secrets',
      selfsubjectrulesreviews:      {group: 'authorization.k8s.io',   resource: 'selfsubjectrulesreviews'},
      services:                     'services',
      serviceaccounts:              'serviceaccounts',
      serviceclasses:               {group: 'servicecatalog.k8s.io',  resource: 'serviceclasses' },
      statefulsets:                 {group: 'apps',                   resource: 'statefulsets' },
      templates:                    {group: 'template.openshift.io',  resource: 'templates'}
  });
