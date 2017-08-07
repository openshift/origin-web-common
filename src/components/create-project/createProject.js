"use strict";

angular.module("openshiftCommonUI")

  .directive("createProject", function($window) {
    return {
      restrict: 'E',
      scope: {
        redirectAction: '&',
        onCancel: '&?',
        isDialog: '@'
      },
      templateUrl: 'src/components/create-project/createProject.html',
      controller: function($scope, $location, ProjectsService, NotificationsService, displayNameFilter) {
        if(!($scope.submitButtonLabel)) {
          $scope.submitButtonLabel = 'Create';
        }

        $scope.isDialog = $scope.isDialog === 'true';

        var hideErrorNotifications = function() {
          NotificationsService.hideNotification('create-project-error');
        };

        $scope.createProject = function() {
          $scope.disableInputs = true;
          if ($scope.createProjectForm.$valid) {
            ProjectsService.create($scope.name, $scope.displayName, $scope.description)
              .then(function(project) {
                // angular is actually wrapping the redirect action
                var cb = $scope.redirectAction();
                if (cb) {
                  cb(encodeURIComponent(project.metadata.name));
                } else {
                  $location.path("project/" + encodeURIComponent(project.metadata.name) + "/create");
                }
                NotificationsService.addNotification({
                  type: "success",
                  message: "Project \'"  + displayNameFilter(project) + "\' was successfully created."
                });
              }, function(result) {
                $scope.disableInputs = false;
                var data = result.data || {};
                if (data.reason === 'AlreadyExists') {
                  $scope.nameTaken = true;
                } else {
                  var msg = data.message || 'An error occurred creating the project.';
                  NotificationsService.addNotification({
                    id: 'create-project-error',
                    type: 'error',
                    message: msg
                  });
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
          } else {
            $window.history.back();
          }
        };

        $scope.$on("$destroy", hideErrorNotifications);
      }
    };
  });
