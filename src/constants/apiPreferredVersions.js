'use strict';

angular.module('openshiftCommonServices')
  .constant('API_PREFERRED_VERSIONS', {
      appliedclusterresourcequotas:     {group: 'quota.openshift.io',         version: 'v1',      resource: 'appliedclusterresourcequotas' },
      builds:                           {group: 'build.openshift.io',         version: 'v1',      resource: 'builds' },
      'builds/clone':                   {group: 'build.openshift.io',         version: 'v1',      resource: 'builds/clone' },
      'buildconfigs/instantiate':       {group: 'build.openshift.io',         version: 'v1',      resource: 'buildconfigs/instantiate' },
      buildconfigs:                     {group: 'build.openshift.io',         version: 'v1',      resource: 'buildconfigs' },
      configmaps:                       {version: 'v1',                       resource: 'configmaps' },
      // Using the anticipated name for the resources, even though they aren't yet prefixed with `cluster`.
      // https://github.com/kubernetes-incubator/service-catalog/issues/1288
      clusterserviceclasses:            {group: 'servicecatalog.k8s.io',      resource: 'serviceclasses' },
      clusterserviceplans:              {group: 'servicecatalog.k8s.io',      resource: 'serviceplans' },
      deployments:                      {group: 'apps',                       version: 'v1beta1', resource: 'deployments' },
      deploymentconfigs:                {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs' },
	    'deploymentconfigs/instantiate':  {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs/instantiate' },
      'deploymentconfigs/rollback':     {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs/rollback' },
      events:                           {version: 'v1',                       resource: 'events' },
      horizontalpodautoscalers:         {group: 'autoscaling',                version: 'v1',      resource: 'horizontalpodautoscalers' },
      imagestreams:                     {group: 'image.openshift.io',         version: 'v1',      resource: 'imagestreams' },
      imagestreamtags:                  {group: 'image.openshift.io',         version: 'v1',      resource: 'imagestreamtags' },
      limitranges:                      {version: 'v1',                       resource: 'limitranges' },
      pods:                             {version: 'v1',                       resource: 'pods' },
      projects:                         {group: 'project.openshift.io',       version: 'v1',      resource: 'projects' },
      projectrequests:                  {group: 'project.openshift.io',       version: 'v1',      resource: 'projectrequests' },
      persistentvolumeclaims:           {version: 'v1',                       resource: 'persistentvolumeclaims' },
      replicasets:                      {group: 'extensions',                 version: 'v1beta1', resource: 'replicasets' },
      replicationcontrollers:           {version: 'v1',                       resource: 'replicationcontrollers' },
      resourcequotas:                   {version: 'v1',                       resource: 'resourcequotas' },
      rolebindings:                     {version: 'v1',                       resource: 'rolebindings' },
      routes:                           {group: 'route.openshift.io',         version: 'v1',      resource: 'routes' },
      secrets:                          {version: 'v1',                       resource: 'secrets' },
      selfsubjectrulesreviews:          {group: 'authorization.openshift.io', version: 'v1',      resource: 'selfsubjectrulesreviews' },
      services:                         {version: 'v1',                       resource: 'services' },
      serviceaccounts:                  {version: 'v1',                       resource: 'serviceaccounts' },
      // Using the anticipated name for this resource, even though it's not currently called servicebindings.
      servicebindings:                  {group: 'servicecatalog.k8s.io',      resource: 'serviceinstancecredentials' },
      serviceinstances:                 {group: 'servicecatalog.k8s.io',      resource: 'serviceinstances' },
      statefulsets:                     {group: 'apps',                       version: 'v1beta1', resource: 'statefulsets' },
      templates:                        {group: 'template.openshift.io',      verison: 'v1',      resource: 'templates' }
  });
