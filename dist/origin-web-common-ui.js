/**
 * @name  openshiftCommonUI
 *
 * @description
 *   Base module for openshiftCommonUI.
 */
angular.module('openshiftCommonUI', []);


hawtioPluginLoader.addModule('openshiftCommonUI');
;angular.module('openshiftCommonUI').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/components/create-project/createProject.html',
    "<form name=\"createProjectForm\">\n" +
    "  <fieldset ng-disabled=\"disableInputs\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"name\" class=\"required\">Name</label>\n" +
    "      <span ng-class=\"{'has-error': (createProjectForm.name.$error.pattern && createProjectForm.name.$touched) || nameTaken}\">\n" +
    "        <input class=\"form-control input-lg\"\n" +
    "            name=\"name\"\n" +
    "            id=\"name\"\n" +
    "            placeholder=\"my-project\"\n" +
    "            type=\"text\"\n" +
    "            required\n" +
    "            take-focus\n" +
    "            minlength=\"2\"\n" +
    "            maxlength=\"63\"\n" +
    "            pattern=\"[a-z0-9]([-a-z0-9]*[a-z0-9])?\"\n" +
    "            aria-describedby=\"nameHelp\"\n" +
    "            ng-model=\"name\"\n" +
    "            ng-model-options=\"{ updateOn: 'default blur' }\"\n" +
    "            ng-change=\"nameTaken = false\"\n" +
    "            autocorrect=\"off\"\n" +
    "            autocapitalize=\"off\"\n" +
    "            spellcheck=\"false\">\n" +
    "      </span>\n" +
    "      <div>\n" +
    "        <span class=\"help-block\">A unique name for the project.</span>\n" +
    "      </div>\n" +
    "      <div class=\"has-error\">\n" +
    "        <span id=\"nameHelp\" class=\"help-block\" ng-if=\"createProjectForm.name.$error.minlength && createProjectForm.name.$touched\">\n" +
    "          Name must have at least two characters.\n" +
    "        </span>\n" +
    "      </div>\n" +
    "      <div class=\"has-error\">\n" +
    "        <span id=\"nameHelp\" class=\"help-block\" ng-if=\"createProjectForm.name.$error.pattern && createProjectForm.name.$touched\">\n" +
    "          Project names may only contain lower-case letters, numbers, and dashes.\n" +
    "          They may not start or end with a dash.\n" +
    "        </span>\n" +
    "      </div>\n" +
    "      <div class=\"has-error\">\n" +
    "        <span class=\"help-block\" ng-if=\"nameTaken\">\n" +
    "          This name is already in use. Please choose a different name.\n" +
    "        </span>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"displayName\">Display Name</label>\n" +
    "      <input class=\"form-control input-lg\"\n" +
    "          name=\"displayName\"\n" +
    "          id=\"displayName\"\n" +
    "          placeholder=\"My Project\"\n" +
    "          type=\"text\"\n" +
    "          ng-model=\"displayName\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"description\">Description</label>\n" +
    "      <textarea class=\"form-control input-lg\"\n" +
    "          name=\"description\"\n" +
    "          id=\"description\"\n" +
    "          placeholder=\"A short description.\"\n" +
    "          ng-model=\"description\"></textarea>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"button-group\">\n" +
    "      <button type=\"submit\"\n" +
    "          class=\"btn btn-primary btn-lg\"\n" +
    "          ng-class=\"{'dialog-btn': isDialog}\"\n" +
    "          ng-click=\"createProject()\"\n" +
    "          ng-disabled=\"createProjectForm.$invalid || nameTaken || disableInputs\"\n" +
    "          value=\"\">\n" +
    "        {{submitButtonLabel}}\n" +
    "      </button>\n" +
    "      <button\n" +
    "          class=\"btn btn-default btn-lg\"\n" +
    "          ng-class=\"{'dialog-btn': isDialog}\"\n" +
    "          back\n" +
    "          ng-click=\"cancelCreateProject()\">\n" +
    "        Cancel\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </fieldset>\n" +
    "</form>\n"
  );


  $templateCache.put('src/components/delete-project/delete-project-button.html',
    "<div class=\"actions\">\n" +
    "  <!-- Avoid whitespace inside the link -->\n" +
    "  <a href=\"\"\n" +
    "     ng-click=\"$event.stopPropagation(); openDeleteModal()\"\n" +
    "     role=\"button\"\n" +
    "     class=\"action-button\"\n" +
    "     ng-attr-aria-disabled=\"{{disableDelete ? 'true' : undefined}}\"\n" +
    "     ng-class=\"{ 'disabled-link': disableDelete }\"\n" +
    "    ><i class=\"fa fa-trash-o\" aria-hidden=\"true\"\n" +
    "    ></i><span class=\"sr-only\">Delete Project {{projectName}}</span></a>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/delete-project/delete-project-modal.html',
    "<div class=\"delete-resource-modal\">\n" +
    "  <!-- Use a form so that the enter key submits when typing a project name to confirm. -->\n" +
    "  <form>\n" +
    "    <div class=\"modal-body\">\n" +
    "      <h1>Are you sure you want to delete the project\n" +
    "        '<strong>{{displayName ? displayName : projectName}}</strong>'?</h1>\n" +
    "      <p>\n" +
    "        This will <strong>delete all resources</strong> associated with\n" +
    "        the project {{displayName ? displayName : projectName}} and <strong>cannot be\n" +
    "        undone</strong>.  Make sure this is something you really want to do!\n" +
    "      </p>\n" +
    "      <div ng-show=\"typeNameToConfirm\">\n" +
    "        <p>Type the name of the project to confirm.</p>\n" +
    "        <p>\n" +
    "          <label class=\"sr-only\" for=\"resource-to-delete\">project to delete</label>\n" +
    "          <input\n" +
    "              ng-model=\"confirmName\"\n" +
    "              id=\"resource-to-delete\"\n" +
    "              type=\"text\"\n" +
    "              class=\"form-control input-lg\"\n" +
    "              autocorrect=\"off\"\n" +
    "              autocapitalize=\"off\"\n" +
    "              spellcheck=\"false\"\n" +
    "              autofocus>\n" +
    "        </p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"modal-footer\">\n" +
    "      <button ng-disabled=\"typeNameToConfirm && confirmName !== projectName && confirmName !== displayName\" class=\"btn btn-lg btn-danger\" type=\"submit\" ng-click=\"delete();\">Delete</button>\n" +
    "      <button class=\"btn btn-lg btn-default\" type=\"button\" ng-click=\"cancel();\">Cancel</button>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/delete-project/delete-project.html',
    "<a href=\"javascript:void(0)\"\n" +
    "   ng-click=\"openDeleteModal()\"\n" +
    "   role=\"button\"\n" +
    "   ng-attr-aria-disabled=\"{{disableDelete ? 'true' : undefined}}\"\n" +
    "   ng-class=\"{ 'disabled-link': disableDelete }\"\n" +
    ">{{label || 'Delete'}}</a>\n"
  );


  $templateCache.put('src/components/edit-project/editProject.html',
    "<form name=\"editProjectForm\">\n" +
    "  <fieldset ng-disabled=\"disableInputs\">\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"displayName\">Display Name</label>\n" +
    "      <input class=\"form-control input-lg\"\n" +
    "             name=\"displayName\"\n" +
    "             id=\"displayName\"\n" +
    "             placeholder=\"My Project\"\n" +
    "             type=\"text\"\n" +
    "             ng-model=\"editableFields.displayName\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"description\">Description</label>\n" +
    "                    <textarea class=\"form-control input-lg\"\n" +
    "                              name=\"description\"\n" +
    "                              id=\"description\"\n" +
    "                              placeholder=\"A short description.\"\n" +
    "                              ng-model=\"editableFields.description\"></textarea>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"button-group\">\n" +
    "      <button type=\"submit\"\n" +
    "              class=\"btn btn-primary btn-lg\"\n" +
    "              ng-class=\"{'dialog-btn': isDialog}\"\n" +
    "              ng-click=\"update()\"\n" +
    "              ng-disabled=\"editProjectForm.$invalid || disableInputs\"\n" +
    "              value=\"\">{{submitButtonLabel}}</button>\n" +
    "      <button\n" +
    "          class=\"btn btn-default btn-lg\"\n" +
    "          ng-class=\"{'dialog-btn': isDialog}\"\n" +
    "          back\n" +
    "          ng-click=\"cancelEditProject()\">\n" +
    "        Cancel\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </fieldset>\n" +
    "</form>\n"
  );


  $templateCache.put('src/components/truncate-long-text/truncateLongText.html',
    "<!--\n" +
    "  Do not remove class `truncated-content` (here or below) even though it's not\n" +
    "  styled directly in origin-web-common.  `truncated-content` is used by\n" +
    "  origin-web-console in certain contexts.\n" +
    "-->\n" +
    "<span ng-if=\"!truncated\" ng-bind-html=\"content | highlightKeywords : keywords\" class=\"truncated-content\"></span>\n" +
    "<span ng-if=\"truncated\">\n" +
    "  <span ng-if=\"!toggles.expanded\">\n" +
    "    <span ng-attr-title=\"{{content}}\" class=\"truncation-block\">\n" +
    "      <span ng-bind-html=\"truncatedContent | highlightKeywords : keywords\" class=\"truncated-content\"></span>&hellip;\n" +
    "    </span>\n" +
    "    <a ng-if=\"expandable\" href=\"\" ng-click=\"toggles.expanded = true\" class=\"nowrap\">See All</a>\n" +
    "  </span>\n" +
    "  <span ng-if=\"toggles.expanded\">\n" +
    "    <div ng-if=\"prettifyJson\" class=\"well\">\n" +
    "      <span class=\"pull-right\" style=\"margin-top: -10px;\"><a href=\"\" ng-click=\"toggles.expanded = false\" class=\"truncation-collapse-link\">Collapse</a></span>\n" +
    "      <span ng-bind-html=\"content | prettifyJSON | highlightKeywords : keywords\" class=\"pretty-json truncated-content\"></span>\n" +
    "    </div>\n" +
    "    <span ng-if=\"!prettifyJson\">\n" +
    "      <span class=\"pull-right\"><a href=\"\" ng-click=\"toggles.expanded = false\" class=\"truncation-collapse-link\">Collapse</a></span>\n" +
    "      <span ng-bind-html=\"content | highlightKeywords : keywords\" class=\"truncated-content\"></span>\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</span>\n"
  );

}]);
;"use strict";

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
;'use strict';

angular.module("openshiftCommonUI")
  .directive("deleteProject", function ($uibModal, $location, $filter, $q, hashSizeFilter, APIService, DataService, AlertMessageService, Logger) {
    return {
      restrict: "E",
      scope: {
        // The name of project to delete
        projectName: "@",
        // Alerts object for success and error alerts.
        alerts: "=",
        // Optional display name of the project to delete.
        displayName: "@",
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
        var showAlert = function(alert) {
          if (scope.stayOnCurrentPage) {
            scope.alerts[alert.name] = alert.data;
          } else {
            AlertMessageService.addAlert(alert);
          }
        };

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
            var projectName = scope.projectName;
            var formattedResource = "Project \'"  + scope.displayName + "\'";
            var context = {};

            DataService.delete({
              resource: APIService.kindToResource("Project")
            }, projectName, context)
            .then(function() {
              showAlert({
                name: projectName,
                data: {
                  type: "success",
                  message: _.capitalize(formattedResource) + " was marked for deletion."
                }
              });

              if (scope.success) {
                scope.success();
              }

              navigateToList();
            })
            .catch(function(err) {
              // called if failure to delete
              scope.alerts[projectName] = {
                type: "error",
                message: _.capitalize(formattedResource) + "\'" + " could not be deleted.",
                details: $filter('getErrorDetails')(err)
              };
              Logger.error(formattedResource + " could not be deleted.", err);
            });
          });
        };
      }
    };
  });

;'use strict';
/* jshint unused: false */

/**
 * @ngdoc function
 * @name openshiftCommonUI.controller:DeleteProjectModalController
 */
angular.module('openshiftCommonUI')
  .controller('DeleteProjectModalController', function ($scope, $uibModalInstance) {
    $scope.delete = function() {
      $uibModalInstance.close('delete');
    };

    $scope.cancel = function() {
      $uibModalInstance.dismiss('cancel');
    };
  });
;"use strict";

angular.module("openshiftCommonUI")

  .directive("editProject", function() {
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
          }
        };
      },
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  // The HTML5 `autofocus` attribute does not work reliably with Angular,
  // so define our own directive
  .directive('takeFocus', function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        // Add a delay to allow other asynchronous components to load.
        $timeout(function() {
          $(element).focus();
        }, 300);
      }
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  // Truncates text to a length, adding a tooltip and an ellipsis if truncated.
  // Different than `text-overflow: ellipsis` because it allows for multiline text.
  .directive('truncateLongText', function(truncateFilter) {
    return {
      restrict: 'E',
      scope: {
        content: '=',
        limit: '=',
        newlineLimit: '=',
        useWordBoundary: '=',
        expandable: '=',
        keywords: '=highlightKeywords',  // optional keywords to highlight using the `highlightKeywords` filter
        prettifyJson: '='                // prettifies JSON blobs when expanded, only used if expandable is true
      },
      templateUrl: 'src/components/truncate-long-text/truncateLongText.html',
      link: function(scope) {
        scope.toggles = {expanded: false};
        scope.$watch('content', function(content) {
          if (content) {
            scope.truncatedContent = truncateFilter(content, scope.limit, scope.useWordBoundary, scope.newlineLimit);
            scope.truncated = scope.truncatedContent.length !== content.length;
          }
          else {
            scope.truncatedContent = null;
            scope.truncated = false;
          }
        });
      }
    };
  });
;'use strict';
/* jshint unused: false */

angular.module('openshiftCommonUI')
  .filter('annotationName', function() {
    // This maps an annotation key to all known synonymous keys to insulate
    // the referring code from key renames across API versions.
    var annotationMap = {
      "buildConfig":              ["openshift.io/build-config.name"],
      "deploymentConfig":         ["openshift.io/deployment-config.name"],
      "deployment":               ["openshift.io/deployment.name"],
      "pod":                      ["openshift.io/deployer-pod.name"],
      "deployerPod":              ["openshift.io/deployer-pod.name"],
      "deployerPodFor":           ["openshift.io/deployer-pod-for.name"],
      "deploymentStatus":         ["openshift.io/deployment.phase"],
      "deploymentStatusReason":   ["openshift.io/deployment.status-reason"],
      "deploymentCancelled":      ["openshift.io/deployment.cancelled"],
      "encodedDeploymentConfig":  ["openshift.io/encoded-deployment-config"],
      "deploymentVersion":        ["openshift.io/deployment-config.latest-version"],
      "displayName":              ["openshift.io/display-name"],
      "description":              ["openshift.io/description"],
      "buildNumber":              ["openshift.io/build.number"],
      "buildPod":                 ["openshift.io/build.pod-name"],
      "jenkinsBuildURL":          ["openshift.io/jenkins-build-uri"],
      "jenkinsLogURL":            ["openshift.io/jenkins-log-url"],
      "jenkinsStatus":            ["openshift.io/jenkins-status-json"],
      "idledAt":                  ["idling.alpha.openshift.io/idled-at"],
      "idledPreviousScale":       ["idling.alpha.openshift.io/previous-scale"],
      "systemOnly":               ["authorization.openshift.io/system-only"]
    };
    return function(annotationKey) {
      return annotationMap[annotationKey] || null;
    };
  })
  .filter('annotation', function(annotationNameFilter) {
    return function(resource, key) {
      if (resource && resource.metadata && resource.metadata.annotations) {
        // If the key's already in the annotation map, return it.
        if (resource.metadata.annotations[key] !== undefined) {
          return resource.metadata.annotations[key];
        }
        // Try and return a value for a mapped key.
        var mappings = annotationNameFilter(key) || [];
        for (var i=0; i < mappings.length; i++) {
          var mappedKey = mappings[i];
          if (resource.metadata.annotations[mappedKey] !== undefined) {
            return resource.metadata.annotations[mappedKey];
          }
        }
        // Couldn't find anything.
        return null;
      }
      return null;
    };
  })
  .filter('imageStreamTagAnnotation', function() {
    // Look up annotations on ImageStream.spec.tags[tag].annotations
    return function(resource, key, /* optional */ tagName) {
      tagName = tagName || 'latest';
      if (resource && resource.spec && resource.spec.tags){
        var tags = resource.spec.tags;
        for(var i=0; i < tags.length; ++i){
          var tag = tags[i];
          if(tagName === tag.name && tag.annotations){
            return tag.annotations[key];
          }
        }
      }

      return null;
    };
  })
  .filter('imageStreamTagTags', function(imageStreamTagAnnotationFilter) {
    // Return ImageStream.spec.tag[tag].annotation.tags as an array
    return function(resource, /* optional */ tagName) {
      var imageTags = imageStreamTagAnnotationFilter(resource, 'tags', tagName);
      if (!imageTags) {
        return [];
      }

      return imageTags.split(/\s*,\s*/);
    };
  })
  .filter('imageStreamTagIconClass', function(imageStreamTagAnnotationFilter) {
  return function(resource, /* optional */ tagName) {
    var icon = imageStreamTagAnnotationFilter(resource, "iconClass", tagName);
    return (icon) ? icon : "fa fa-cube";
  };
});

;'use strict';

angular
  .module('openshiftCommonUI')
  .filter('canI', function(AuthorizationService) {
    return function(resource, verb, projectName) {
      return AuthorizationService.canI(resource, verb, projectName);
    };
  })
  .filter('canIAddToProject', function(AuthorizationService) {
    return function(namespace) {
      return AuthorizationService.canIAddToProject(namespace);
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  .filter('isNewerResource', function() {
    // Checks if candidate is newer than other.
    return function(candidate, other) {
      var candidateCreation = _.get(candidate, 'metadata.creationTimestamp');
      if (!candidateCreation) {
        return false;
      }

      var otherCreation = _.get(other, 'metadata.creationTimestamp');
      if (!otherCreation) {
        return true;
      }

      // The date format can be compared using straight string comparison.
      // Example Date: 2016-02-02T21:53:07Z
      return candidateCreation > otherCreation;
    };
  })
  .filter('mostRecent', function(isNewerResourceFilter) {
    return function(objects) {
      var mostRecent = null;
      _.each(objects, function(object) {
        if (!mostRecent || isNewerResourceFilter(object, mostRecent)) {
          mostRecent = object;
        }
      });

      return mostRecent;
    };
  })
  .filter('orderObjectsByDate', function(toArrayFilter) {
    return function(items, reverse) {
      items = toArrayFilter(items);

      /*
       * Note: This is a hotspot in our code. We sort frequently by date on
       *       the overview and browse pages.
       */

      items.sort(function (a, b) {
        if (!a.metadata || !a.metadata.creationTimestamp || !b.metadata || !b.metadata.creationTimestamp) {
          throw "orderObjectsByDate expects all objects to have the field metadata.creationTimestamp";
        }

        // The date format can be sorted using straight string comparison.
        // Compare as strings for performance.
        // Example Date: 2016-02-02T21:53:07Z
        if (a.metadata.creationTimestamp < b.metadata.creationTimestamp) {
          return reverse ? 1 : -1;
        }

        if (a.metadata.creationTimestamp > b.metadata.creationTimestamp) {
          return reverse ? -1 : 1;
        }

        return 0;
      });

      return items;
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  .filter('highlightKeywords', function(KeywordService) {
    // Returns HTML wrapping the matching words in a `mark` tag.
    return function(str, keywords, caseSensitive) {
      if (!str) {
        return str;
      }

      if (_.isEmpty(keywords)) {
        return _.escape(str);
      }

      // If passed a plain string, get the keywords from KeywordService.
      if (_.isString(keywords)) {
        keywords = KeywordService.generateKeywords(keywords);
      }

      // Combine the keywords into a single regex.
      var source = _.map(keywords, function(keyword) {
        if (_.isRegExp(keyword)) {
          return keyword.source;
        }
        return _.escapeRegExp(keyword);
      }).join('|');

      // Search for matches.
      var match;
      var result = '';
      var lastIndex = 0;
      var flags = caseSensitive ? 'g' : 'ig';
      var regex = new RegExp(source, flags);
      while ((match = regex.exec(str)) !== null) {
        // Escape any text between the end of the last match and the start of
        // this match, and add it to the result.
        if (lastIndex < match.index) {
          result += _.escape(str.substring(lastIndex, match.index));
        }

        // Wrap the match in a `mark` element to use the Bootstrap / Patternfly highlight styles.
        result += "<mark>" + _.escape(match[0]) + "</mark>";
        lastIndex = regex.lastIndex;
      }

      // Escape any remaining text and add it to the result.
      if (lastIndex < str.length) {
        result += _.escape(str.substring(lastIndex));
      }

      return result;
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  .filter('parseJSON', function() {
    return function(json) {
      // return original value if its null or undefined
      if (!json) {
        return null;
      }

      // return the parsed obj if its valid
      try {
        var jsonObj = JSON.parse(json);
        if (typeof jsonObj === "object") {
          return jsonObj;
        }
        else {
          return null;
        }
      }
      catch (e) {
        // it wasn't valid json
        return null;
      }
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  .filter('prettifyJSON', function(parseJSONFilter) {
    return function(json) {
      var jsonObj = parseJSONFilter(json);
      if (jsonObj) {
        return JSON.stringify(jsonObj, null, 4);
      }
      else {
        // it wasn't a json object, return the original value
        return json;
      }
    };
  });
;'use strict';
/* jshint unused: false */

angular.module('openshiftCommonUI')
  // this filter is intended for use with the "track by" in an ng-repeat
  // when uid is not defined it falls back to object identity for uniqueness
  .filter('uid', function() {
    return function(resource) {
      if (resource && resource.metadata && resource.metadata.uid) {
        return resource.metadata.uid;
      }
      else {
        return resource;
      }
    };
  })
  .filter('labelName', function() {
    var labelMap = {
      'buildConfig' : ["openshift.io/build-config.name"],
      'deploymentConfig' : ["openshift.io/deployment-config.name"]
    };
    return function(labelKey) {
      return labelMap[labelKey];
    };
  })
  .filter('description', function(annotationFilter) {
    return function(resource) {
      // Prefer `openshift.io/description`, but fall back to `kubernetes.io/description`.
      return annotationFilter(resource, 'openshift.io/description') ||
             annotationFilter(resource, 'kubernetes.io/description');
    };
  })
  .filter('displayName', function(annotationFilter) {
    // annotationOnly - if true, don't fall back to using metadata.name when
    //                  there's no displayName annotation
    return function(resource, annotationOnly) {
      var displayName = annotationFilter(resource, "displayName");
      if (displayName || annotationOnly) {
        return displayName;
      }

      if (resource && resource.metadata) {
        return resource.metadata.name;
      }

      return null;
    };
  })
  .filter('uniqueDisplayName', function(displayNameFilter){
    function countNames(projects){
      var nameCount = {};
      angular.forEach(projects, function(project, key){
        var displayName = displayNameFilter(project);
        nameCount[displayName] = (nameCount[displayName] || 0) + 1;
      });
      return nameCount;
    }
    return function (resource, projects){
      if (!resource) {
        return '';
      }
      var displayName = displayNameFilter(resource);
      var name = resource.metadata.name;
      if (displayName !== name && countNames(projects)[displayName] > 1 ){
        return displayName + ' (' + name + ')';
      }
      return displayName;
    };
  })
  .filter('searchProjects', function(displayNameFilter) {
    return function(projects, text) {
      if (!text) {
        return projects;
      }

      // Lowercase the search string and project display name to perform a case-insensitive search.
      text = text.toLowerCase();
      return _.filter(projects, function(project) {
        if (_.includes(project.metadata.name, text)) {
          return true;
        }

        var displayName = displayNameFilter(project, true);
        if (displayName && _.includes(displayName.toLowerCase(), text)) {
          return true;
        }

        return false;
      });
    };
  })
  .filter('label', function() {
    return function(resource, key) {
      if (resource && resource.metadata && resource.metadata.labels) {
        return resource.metadata.labels[key];
      }
      return null;
    };
  })
  .filter('humanizeKind', function (startCaseFilter) {
    // Changes "ReplicationController" to "replication controller".
    // If useTitleCase, returns "Replication Controller".
    return function(kind, useTitleCase) {
      if (!kind) {
        return kind;
      }

      var humanized = _.startCase(kind);
      if (useTitleCase) {
        return humanized;
      }

      return humanized.toLowerCase();
    };
  });
;'use strict';
angular.module('openshiftCommonUI')
  .filter('camelToLower', function() {
    return function(str) {
      if (!str) {
        return str;
      }

      // Use the special logic in _.startCase to handle camel case strings, kebab
      // case strings, snake case strings, etc.
      return _.startCase(str).toLowerCase();
    };
  })
  .filter('upperFirst', function() {
    // Uppercase the first letter of a string (without making any other changes).
    // Different than `capitalize` because it doesn't lowercase other letters.
    return function(str) {
      if (!str) {
        return str;
      }

      return str.charAt(0).toUpperCase() + str.slice(1);
    };
  })
  .filter('sentenceCase', function(camelToLowerFilter, upperFirstFilter) {
    // Converts a camel case string to sentence case
    return function(str) {
      if (!str) {
        return str;
      }

      // Unfortunately, _.lowerCase() and _.upperFirst() aren't in our lodash version.
      var lower = camelToLowerFilter(str);
      return upperFirstFilter(lower);
    };
  })
  .filter('startCase', function () {
    return function(str) {
      if (!str) {
        return str;
      }

      // https://lodash.com/docs#startCase
      return _.startCase(str);
    };
  })
  .filter('capitalize', function() {
    return function(input) {
      return _.capitalize(input);
    };
  })
  .filter('isMultiline', function() {
    return function(str, ignoreTrailing) {
      if (!str) {
        return false;
      }

      var index = str.search(/\r|\n/);
      if (index === -1) {
        return false;
      }

      // Ignore a final, trailing newline?
      if (ignoreTrailing) {
        return index !== (str.length - 1);
      }

      return true;
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  .filter('truncate', function() {
    return function(str, charLimit, useWordBoundary, newlineLimit) {
      if (!str) {
        return str;
      }

      var truncated = str;

      if (charLimit) {
        truncated = truncated.substring(0, charLimit);
      }

      if (newlineLimit) {
        var nthNewline = str.split("\n", newlineLimit).join("\n").length;
        truncated = truncated.substring(0, nthNewline);
      }

      if (useWordBoundary !== false) {
        // Find the last word break, but don't look more than 10 characters back.
        // Make sure we show at least the first 5 characters.
        var startIndex = Math.max(4, charLimit - 10);
        var lastSpace = truncated.lastIndexOf(/\s/, startIndex);
        if (lastSpace !== -1) {
          truncated = truncated.substring(0, lastSpace);
        }
      }

      return truncated;
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  .filter("toArray", function() {
    return function (items) {
      if (!items) {
        return [];
      }

      if (angular.isArray(items)) {
        return items;
      }

      var itemsArray = [];
      angular.forEach(items, function (item) {
        itemsArray.push(item);
      });

      return itemsArray;
    };
  })
  .filter('hashSize', function() {
    return function(hash) {
      if(!hash) { return 0; }
      return Object.keys(hash).length;
    };
  })
  .filter('generateName', function() {
    return function(prefix, length) {
      if (!prefix) {
        prefix = "";
      }
      if (!length) {
        length = 5;
      }
      var randomString = Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
      return prefix + randomString;
    };
  });
