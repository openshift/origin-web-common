'use strict';

angular.module('openshiftCommonServices')
  .constant('API_DEDUPLICATION', {
    // Exclude duplicate kinds we know about that map to the same storage as another
    //  group/kind.  This is unusual, so we are special casing these.
    groups: [{group: 'authorization.openshift.io'}],
    kinds: [
      {group: 'extensions', kind: 'DaemonSet'},
      {group: 'extensions', kind: 'HorizontalPodAutoscaler'},
      {group: 'extensions', kind: 'NetworkPolicy'}
    ]
  });
