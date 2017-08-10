'use strict';

angular.module("openshiftCommonUI")
  .directive("deleteProject", function($uibModal, $location, $filter, $q, hashSizeFilter, APIService, NotificationsService, ProjectsService, Logger) {
    return {
      restrict: "E",
      scope: {
        // The project to delete
        project: "=",
        // Set to true to disable the delete button.
        disableDelete: "=?",
        // Force the user to enter the name before we'll delete the project.
        typeNameToConfirm: "=?",
        // Optional link label. Defaults to "Delete".
        label: "@?",
        // Only show a delete icon with no text.
        buttonOnly: "@",
        // Stay on the current page without redirecting to the projects list.
        stayOnCurrentPage: "=?",
        // Optional callback when the delete succeeds
        success: "=?",
        // Optional redirect URL when the delete succeeds
        redirectUrl: "@?"
      },
      templateUrl: function(elem, attr) {
        if (angular.isDefined(attr.buttonOnly)) {
          return "src/components/delete-project/delete-project-button.html";
        }

        return "src/components/delete-project/delete-project.html";
      },
      // Replace so ".dropdown-menu > li > a" styles are applied.
      replace: true,
      link: function(scope, element, attrs) {
        var displayName = $filter('displayName');
        var navigateToList = function() {
          if (scope.stayOnCurrentPage) {
            return;
          }

          if (scope.redirectUrl) {
            $location.url(scope.redirectUrl);
            return;
          }

          if ($location.path() === '/') {
            scope.$emit('deleteProject');
            return;
          }

          var homeRedirect = URI('/');
          $location.url(homeRedirect);
        };

        scope.openDeleteModal = function() {
          if (scope.disableDelete) {
            return;
          }

          // opening the modal with settings scope as parent
          var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'src/components/delete-project/delete-project-modal.html',
            controller: 'DeleteProjectModalController',
            scope: scope
          });

          modalInstance.result.then(function() {
            // upon clicking delete button, delete resource and send alert
            var formattedResource = "Project \'"  + displayName(scope.project) + "\'";

            ProjectsService.delete(scope.project).then(function() {
              NotificationsService.addNotification({
                type: "success",
                message: formattedResource + " was marked for deletion."
              });

              if (scope.success) {
                scope.success();
              }

              navigateToList();
            })
            .catch(function(err) {
              // called if failure to delete
              NotificationsService.addNotification({
                type: "error",
                message: formattedResource + " could not be deleted.",
                details: $filter('getErrorDetails')(err)
              });
              Logger.error(formattedResource + " could not be deleted.", err);
            });
          });
        };
      }
    };
  });

