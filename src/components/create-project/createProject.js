"use strict";

angular.module("openshiftCommonUI")

  .directive("createProject", function() {
    return {
      restrict: 'E',
      scope: {
        alerts: '=',
        submitButtonLabel: '@',
        redirectAction: '&',
        onCancel: '&?',
        isDialog: '@'
      },
      templateUrl: 'src/components/create-project/createProject.html',
      controller: function($scope, $filter, $location, DataService) {
        if(!($scope.submitButtonLabel)) {
          $scope.submitButtonLabel = 'Create';
        }

        $scope.isDialog = $scope.isDialog === 'true';

        $scope.createProject = function() {
          $scope.disableInputs = true;
          if ($scope.createProjectForm.$valid) {
            DataService
              .create('projectrequests', null, {
                apiVersion: "v1",
                kind: "ProjectRequest",
                metadata: {
                  name: $scope.name
                },
                displayName: $scope.displayName,
                description: $scope.description
              }, $scope)
              .then(function(data) {
                // angular is actually wrapping the redirect action
                var cb = $scope.redirectAction();
                if (cb) {
                  cb(encodeURIComponent(data.metadata.name));
                } else {
                  $location.path("project/" + encodeURIComponent(data.metadata.name) + "/create");
                }
              }, function(result) {
                $scope.disableInputs = false;
                var data = result.data || {};
                if (data.reason === 'AlreadyExists') {
                  $scope.nameTaken = true;
                } else {
                  var msg = data.message || 'An error occurred creating the project.';
                  $scope.alerts['error-creating-project'] = {type: 'error', message: msg};
                }
              });
          }
        };

        $scope.cancelCreateProject = function() {
          if ($scope.onCancel) {
            var cb = $scope.onCancel();
            if (cb) {
              cb();
            }
          }
        };
      },
    };
  });
