'use strict';

angular.module('openshiftCommonServices')
  .constant('API_PREFERRED_VERSIONS', {
      appliedclusterresourcequotas:     {group: 'quota.openshift.io',         version: 'v1',      resource: 'appliedclusterresourcequotas' },
      builds:                           {group: 'build.openshift.io',         version: 'v1',      resource: 'builds' },
      'builds/clone':                   {group: 'build.openshift.io',         version: 'v1',      resource: 'builds/clone' },
      'builds/log':                     {group: 'build.openshift.io',         version: 'v1',      resource: 'builds/log' },
      'buildconfigs/instantiate':       {group: 'build.openshift.io',         version: 'v1',      resource: 'buildconfigs/instantiate' },
      buildconfigs:                     {group: 'build.openshift.io',         version: 'v1',      resource: 'buildconfigs' },
      configmaps:                       {version: 'v1',                       resource: 'configmaps' },
      clusterroles:                     {group: 'rbac.authorization.k8s.io',  version: 'v1beta1',      resource: 'clusterroles' },
      clusterserviceclasses:            {group: 'servicecatalog.k8s.io',      version: 'v1beta1', resource: 'clusterserviceclasses' },
      clusterserviceplans:              {group: 'servicecatalog.k8s.io',      version: 'v1beta1', resource: 'clusterserviceplans' },
      deployments:                      {group: 'apps',                       version: 'v1beta1', resource: 'deployments' },
      deploymentconfigs:                {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs' },
      'deploymentconfigs/instantiate':  {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs/instantiate' },
      'deploymentconfigs/rollback':     {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs/rollback' },
      'deploymentconfigs/log':          {group: 'apps.openshift.io',          version: 'v1',      resource: 'deploymentconfigs/log' },
      endpoints:                        {version: 'v1',                       resoource: 'endpoints'},
      events:                           {version: 'v1',                       resource: 'events' },
      horizontalpodautoscalers:         {group: 'autoscaling',                version: 'v1',      resource: 'horizontalpodautoscalers' },
      imagestreams:                     {group: 'image.openshift.io',         version: 'v1',      resource: 'imagestreams' },
      imagestreamtags:                  {group: 'image.openshift.io',         version: 'v1',      resource: 'imagestreamtags' },
      imagestreamimages:                {group: 'image.openshift.io',         version: 'v1',      resource: 'imagestreamimages' },
      imagestreamimports:               {group: 'image.openshift.io',         version: 'v1',      resource: 'imagestreamimports' },
      limitranges:                      {version: 'v1',                       resource: 'limitranges' },
      pods:                             {version: 'v1',                       resource: 'pods' },
      'pods/log':                       {version: 'v1',                       resource: 'pods/log' },
      processedtemplates:               {group: 'template.openshift.io',      version: 'v1',      resource: 'processedtemplates' },
      projects:                         {group: 'project.openshift.io',       version: 'v1',      resource: 'projects' },
      projectrequests:                  {group: 'project.openshift.io',       version: 'v1',      resource: 'projectrequests' },
      persistentvolumeclaims:           {version: 'v1',                       resource: 'persistentvolumeclaims' },
      replicasets:                      {group: 'extensions',                 version: 'v1beta1', resource: 'replicasets' },
      replicationcontrollers:           {version: 'v1',                       resource: 'replicationcontrollers' },
      resourcequotas:                   {version: 'v1',                       resource: 'resourcequotas' },
      rolebindings:                     {group: 'rbac.authorization.k8s.io',  version: 'v1beta1',      resource: 'rolebindings' },
      roles:                            {group: 'rbac.authorization.k8s.io',  version: 'v1beta1',      resource: 'roles' },
      routes:                           {group: 'route.openshift.io',         version: 'v1',      resource: 'routes' },
      secrets:                          {version: 'v1',                       resource: 'secrets' },
      selfsubjectrulesreviews:          {group: 'authorization.openshift.io', version: 'v1',      resource: 'selfsubjectrulesreviews' },
      services:                         {version: 'v1',                       resource: 'services' },
      serviceaccounts:                  {version: 'v1',                       resource: 'serviceaccounts' },
      servicebindings:                  {group: 'servicecatalog.k8s.io',      version: 'v1beta1', resource: 'servicebindings' },
      serviceinstances:                 {group: 'servicecatalog.k8s.io',      version: 'v1beta1', resource: 'serviceinstances' },
      statefulsets:                     {group: 'apps',                       version: 'v1beta1', resource: 'statefulsets' },
      storageclasses:                   {group: 'storage.k8s.io',             version: 'v1',      resource: 'storageclasses'},
      templates:                        {group: 'template.openshift.io',      verison: 'v1',      resource: 'templates' },
      users:                            {group: 'user.openshift.io',          version: 'v1',      resource: 'users' }
  });
