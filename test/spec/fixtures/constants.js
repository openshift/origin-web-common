window.OPENSHIFT_CONSTANTS = window.OPENSHIFT_CONSTANTS || {};

window.OPENSHIFT_CONSTANTS.AVAILABLE_KINDS_BLACKLIST = [
    // using this kind to test the blacklisting function in apiService.
    // "Binding"/servicecatalog.k8s.io will not actually be blacklisted.
    { kind: "Binding", group: "servicecatalog.k8s.io" },
    "Ingress",
    // These are things like DCPs that aren't actually persisted resources
    "DeploymentConfigRollback",
    // FOR TESTING:
    // { kind: 'LocalSubjectAccessReview', group: ' authorization.openshift.io' }
    // { kind: 'LocalSubjectAccessReview', group: ' authorization.k8s.io' }
];
