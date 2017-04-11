"use strict";

angular.module("openshiftCommonUI")

  .directive("editProject", function($window) {
    return {
      restrict: 'E',
      scope: {
        project: '=',
        alerts: '=',
        submitButtonLabel: '@',
        redirectAction: '&',
        onCancel: '&',
        isDialog: '@'
      },
      templateUrl: 'src/components/edit-project/editProject.html',
      controller: function($scope, $filter, $location, DataService, annotationNameFilter) {
        if(!($scope.submitButtonLabel)) {
          $scope.submitButtonLabel = 'Save';
        }

        $scope.isDialog = $scope.isDialog === 'true';

        var annotation = $filter('annotation');
        var annotationName = $filter('annotationName');

        var editableFields = function(resource) {
          return {
            description: annotation(resource, 'description'),
            displayName: annotation(resource, 'displayName')
          };
        };

        var mergeEditable = function(project, editable) {
          var toSubmit = angular.copy(project);
          toSubmit.metadata.annotations[annotationName('description')] = editable.description;
          toSubmit.metadata.annotations[annotationName('displayName')] = editable.displayName;
          return toSubmit;
        };

        var cleanEditableAnnotations = function(resource) {
          var paths = [
            annotationNameFilter('description'),
            annotationNameFilter('displayName')
          ];
          _.each(paths, function(path) {
            if(!resource.metadata.annotations[path]) {
              delete resource.metadata.annotations[path];
            }
          });
          return resource;
        };

        $scope.editableFields = editableFields($scope.project);

        $scope.update = function() {
          $scope.disableInputs = true;
          if ($scope.editProjectForm.$valid) {
            DataService
              .update(
                'projects',
                $scope.project.metadata.name,
                cleanEditableAnnotations(mergeEditable($scope.project, $scope.editableFields)),
                {projectName: $scope.project.name},
                {errorNotification: false})
              .then(function() {
                // angular is actually wrapping the redirect action :/
                var cb = $scope.redirectAction();
                if (cb) {
                  cb(encodeURIComponent($scope.project.metadata.name));
                }
              }, function(result) {
                $scope.disableInputs = false;
                $scope.editableFields = editableFields($scope.project);
                $scope.alerts["update"] = {
                  type: "error",
                  message: "An error occurred while updating the project",
                  details: $filter('getErrorDetails')(result)
                };
              });
          }
        };

        $scope.cancelEditProject = function() {
          var cb = $scope.onCancel();
          if (cb) {
            cb();
          } else {
            $window.history.back();
          }
        };
      },
    };
  });
