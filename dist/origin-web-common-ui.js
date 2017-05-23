/**
 * @name  openshiftCommonUI
 *
 * @description
 *   Base module for openshiftCommonUI.
 */
angular.module('openshiftCommonUI', [])
// DNS1123 subdomain patterns are used for name validation of many resources,
// including persistent volume claims, config maps, and secrets.
// See https://github.com/kubernetes/kubernetes/blob/master/pkg/api/validation/validation.go
.constant('DNS1123_SUBDOMAIN_VALIDATION', {
  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
  maxlength: 253,
  description: 'Name must consist of lower-case letters, numbers, periods, and hyphens. It must start and end with a letter or a number.'
});


hawtioPluginLoader.addModule('openshiftCommonUI');
;angular.module('openshiftCommonUI').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/components/binding/bindApplicationForm.html',
    "<div class=\"bind-form\">\n" +
    "  <form>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label>\n" +
    "        <h3>Bind a service to <strong>{{ctrl.applicationName}}</strong></h3>\n" +
    "      </label>\n" +
    "      <span class=\"help-block\">\n" +
    "        Binding to a provisioned service will create a secret containing the information necessary for your application to use the service.\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "\n" +
    "  <form name=\"ctrl.formName\">\n" +
    "    <fieldset>\n" +
    "      <div class=\"radio\">\n" +
    "        <label ng-if=\"ctrl.allowNoBinding\">\n" +
    "          <input type=\"radio\" ng-model=\"ctrl.serviceToBind\" value=\"\">\n" +
    "          Do not bind at this time.\n" +
    "        </label>\n" +
    "        <div ng-if=\"ctrl.allowNoBinding\" class=\"bind-description\">\n" +
    "          <span class=\"help-block service-instance-name\">\n" +
    "            You can create the binding later from your project.\n" +
    "          </span>\n" +
    "        </div>\n" +
    "        <div ng-repeat=\"serviceInstance in ctrl.serviceInstances\">\n" +
    "          <label>\n" +
    "            <input type=\"radio\" ng-model=\"ctrl.serviceToBind\" value=\"{{serviceInstance.metadata.name}}\">\n" +
    "            {{ctrl.serviceClasses[serviceInstance.spec.serviceClassName].osbMetadata.displayName || serviceInstance.spec.serviceClassName}}\n" +
    "          </label>\n" +
    "          <div class=\"bind-description\">\n" +
    "            <span class=\"pficon pficon-info\"\n" +
    "                  ng-if=\"!(serviceInstance | isServiceInstanceReady)\"\n" +
    "                  data-content=\"This service is not yet ready. If you bind to it, then the binding will be pending until the service is ready.\"\n" +
    "                  data-toggle=\"popover\"\n" +
    "                  data-trigger=\"hover\">\n" +
    "            </span>\n" +
    "            <span class=\"help-block service-instance-name\">\n" +
    "              {{serviceInstance.metadata.name}}\n" +
    "            </span>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </fieldset>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/binding/bindResults.html',
    "<div ng-if=\"!ctrl.error\">\n" +
    "  <div ng-if=\"!(ctrl.binding | isBindingReady)\" class=\"bind-status\" ng-class=\"{'text-center': !ctrl.progressInline, 'show-progress': !ctrl.progressInline}\">\n" +
    "    <div class=\"spinner\" ng-class=\"{'spinner-sm': ctrl.progressInline, 'spinner-inline': ctrl.progressInline, 'spinner-lg': !ctrl.progressInline}\" aria-hidden=\"true\"></div>\n" +
    "    <h3 class=\"bind-message\">\n" +
    "      <span class=\"sr-only\">Pending</span>\n" +
    "      <div class=\"bind-pending-message\" ng-class=\"{'progress-inline': ctrl.progressInline}\">The binding was created but is not ready yet.</div>\n" +
    "    </h3>\n" +
    "  </div>\n" +
    "  <div ng-if=\"(ctrl.binding | isBindingReady)\">\n" +
    "    <div class=\"bind-status\">\n" +
    "      <span class=\"pficon pficon-ok\" aria-hidden=\"true\"></span>\n" +
    "      <span class=\"sr-only\">Success</span>\n" +
    "      <h3 class=\"bind-message\">\n" +
    "        <strong>{{ctrl.serviceToBind}}</strong>\n" +
    "        <span>&nbsp;has been bound</span>\n" +
    "        <span ng-if=\"ctrl.applicationToBind\">&nbsp;to <strong>{{ctrl.applicationToBind}}</strong> successfully</span>\n" +
    "      </h3>\n" +
    "    </div>\n" +
    "    <div class=\"sub-title\">\n" +
    "      The binding operation created the secret\n" +
    "      <a ng-if=\"ctrl.secretHref && 'secrets' | canI : 'list'\"\n" +
    "         ng-href=\"{{ctrl.secretHref}}\">{{ctrl.binding.spec.secretName}}</a>\n" +
    "      <span ng-if=\"!ctrl.secretHref || !('secrets' | canI : 'list')\">{{ctrl.binding.spec.secretName}}</span>\n" +
    "      that you may need to reference in your application.\n" +
    "      <span ng-if=\"ctrl.showPodPresets\">Its data will be available to your application as environment variables.</span>\n" +
    "    </div>\n" +
    "    <div class=\"alert alert-info bind-info\">\n" +
    "      <span class=\"pficon pficon-info\" aria-hidden=\"true\"></span>\n" +
    "      <span class=\"sr-only\">Info</span>\n" +
    "      The binding secret will only be available to new pods. You will need to redeploy your application.\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div ng-if=\"ctrl.error\">\n" +
    "  <div class=\"bind-status\">\n" +
    "    <span class=\"pficon pficon-error-circle-o text-danger\" aria-hidden=\"true\"></span>\n" +
    "    <span class=\"sr-only\">Error</span>\n" +
    "    <h3 class=\"bind-message\">\n" +
    "      <span>Binding Failed</span>\n" +
    "    </h3>\n" +
    "  </div>\n" +
    "  <div class=\"sub-title\">\n" +
    "    <span ng-if=\"ctrl.error.data.message\">\n" +
    "      {{ctrl.error.data.message | upperFirst}}\n" +
    "    </span>\n" +
    "    <span ng-if=\"!ctrl.error.data.message\">\n" +
    "      An error occurred creating the binding.\n" +
    "    </span>\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/binding/bindServiceForm.html',
    "<div class=\"bind-form\">\n" +
    "  <form>\n" +
    "    <div class=\"form-group\">\n" +
    "        <label>\n" +
    "          <h3>Bind <strong>{{ctrl.serviceClass.osbMetadata.displayName || ctrl.serviceClassName}}</strong> to an existing application</strong></h3>\n" +
    "        </label>\n" +
    "        <span class=\"help-block\">Binding to a provisioned service will create a secret containing the information necessary for your application to use the service.</span>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "\n" +
    "  <form name=\"ctrl.formName\" class=\"mar-bottom-lg\">\n" +
    "    <fieldset>\n" +
    "      <div class=\"radio\">\n" +
    "        <label class=\"bind-choice\">\n" +
    "          <input type=\"radio\" ng-model=\"ctrl.shouldBindToApp\" value=\"true\">\n" +
    "          Bind to an application\n" +
    "        </label>\n" +
    "        <div class=\"application-select\">\n" +
    "          <ui-select ng-model=\"ctrl.appToBind\"\n" +
    "                     ng-disabled=\"ctrl.shouldBindToApp !== 'true'\"\n" +
    "                     ng-required=\"ctrl.shouldBindToApp === 'true'\">\n" +
    "            <ui-select-match placeholder=\"Select an application\">\n" +
    "            <span>\n" +
    "              {{$select.selected.metadata.name}}\n" +
    "              <small class=\"text-muted\">&ndash; {{$select.selected.kind | humanizeKind : true}}</small>\n" +
    "            </span>\n" +
    "            </ui-select-match>\n" +
    "            <ui-select-choices\n" +
    "              repeat=\"application in (ctrl.applications) | filter : { metadata: { name: $select.search } } track by (application | uid)\"\n" +
    "              group-by=\"ctrl.groupByKind\">\n" +
    "              <span ng-bind-html=\"application.metadata.name | highlight : $select.search\"></span>\n" +
    "            </ui-select-choices>\n" +
    "          </ui-select>\n" +
    "        </div>\n" +
    "        <label class=\"bind-choice\">\n" +
    "          <input type=\"radio\" ng-model=\"ctrl.shouldBindToApp\" value=\"false\">\n" +
    "          Create a secret in my project\n" +
    "        </label>\n" +
    "        <div class=\"help-block bind-description\">\n" +
    "          You can reference this secret later from any application either as environment variables or configuration files mounted as volumes.\n" +
    "        </div>\n" +
    "        <label ng-if=\"ctrl.allowNoBinding\" class=\"bind-choice\">\n" +
    "          <input type=\"radio\" ng-model=\"ctrl.shouldBindToApp\" value=\"none\">\n" +
    "          Do not bind at this time\n" +
    "        </label>\n" +
    "        <div ng-if=\"ctrl.allowNoBinding\" class=\"help-block bind-description\">\n" +
    "          You can create the binding later from your project.\n" +
    "        </div>\n" +
    "      </div>\n" +
    "    </fieldset>\n" +
    "  </form>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/create-project/createProject.html',
    "<form name=\"createProjectForm\" novalidate>\n" +
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
    "        <span id=\"nameHelp\" class=\"help-block\" ng-if=\"createProjectForm.name.$error.required && createProjectForm.name.$dirty\">\n" +
    "          Name is required.\n" +
    "        </span>\n" +
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
    "        Create\n" +
    "      </button>\n" +
    "      <button\n" +
    "          class=\"btn btn-default btn-lg\"\n" +
    "          ng-class=\"{'dialog-btn': isDialog}\"\n" +
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
    "          ng-click=\"cancelEditProject()\">\n" +
    "        Cancel\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </fieldset>\n" +
    "</form>\n"
  );


  $templateCache.put('src/components/toast-notifications/toast-notifications.html',
    "<div class=\"toast-notifications-list-pf\">\n" +
    "  <div ng-repeat=\"(notificationID, notification) in notifications track by (notificationID + (notification.message || notification.details))\" ng-if=\"!notification.hidden\"\n" +
    "       ng-mouseenter=\"setHover(notification, true)\" ng-mouseleave=\"setHover(notification, false)\">\n" +
    "    <div class=\"toast-pf alert {{notification.type | alertStatus}}\" ng-class=\"{'alert-dismissable': !hideCloseButton}\">\n" +
    "      <button ng-if=\"!hideCloseButton\" type=\"button\" class=\"close\" ng-click=\"close(notification)\">\n" +
    "        <span class=\"pficon pficon-close\" aria-hidden=\"true\"></span>\n" +
    "        <span class=\"sr-only\">Close</span>\n" +
    "      </button>\n" +
    "      <span class=\"{{notification.type | alertIcon}}\" aria-hidden=\"true\"></span>\n" +
    "      <span class=\"sr-only\">{{notification.type}}</span>\n" +
    "      <span class=\"toast-notification-message\" ng-if=\"notification.message\">{{notification.message}}</span>\n" +
    "      <span ng-if=\"notification.details\">\n" +
    "        <truncate-long-text\n" +
    "          limit=\"200\"\n" +
    "          content=\"notification.details\"\n" +
    "          use-word-boundary=\"true\"\n" +
    "          expandable=\"true\"\n" +
    "          hide-collapse=\"true\">\n" +
    "        </truncate-long-text>\n" +
    "      </span>\n" +
    "      <span ng-repeat=\"link in notification.links\">\n" +
    "        <a ng-if=\"!link.href\" href=\"\" ng-click=\"onClick(notification, link)\" role=\"button\">{{link.label}}</a>\n" +
    "        <a ng-if=\"link.href\" ng-href=\"{{link.href}}\" ng-attr-target=\"{{link.target}}\">{{link.label}}</a>\n" +
    "        <span ng-if=\"!$last\" class=\"toast-action-divider\">|</span>\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n"
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
    "      <span ng-if=\"!hideCollapse\" class=\"pull-right\" style=\"margin-top: -10px;\"><a href=\"\" ng-click=\"toggles.expanded = false\" class=\"truncation-collapse-link\">Collapse</a></span>\n" +
    "      <span ng-bind-html=\"content | prettifyJSON | highlightKeywords : keywords\" class=\"pretty-json truncated-content\"></span>\n" +
    "    </div>\n" +
    "    <span ng-if=\"!prettifyJson\">\n" +
    "      <span ng-if=\"!hideCollapse\" class=\"pull-right\"><a href=\"\" ng-click=\"toggles.expanded = false\" class=\"truncation-collapse-link\">Collapse</a></span>\n" +
    "      <span ng-bind-html=\"content | highlightKeywords : keywords\" class=\"truncated-content\"></span>\n" +
    "    </span>\n" +
    "  </span>\n" +
    "</span>\n"
  );

}]);
;'use strict';

angular.module('openshiftCommonUI').component('bindApplicationForm', {
  controllerAs: 'ctrl',
  bindings: {
    allowNoBinding: '<?',
    createBinding: '=',
    applicationName: '=',
    formName: '=',
    serviceClasses: '<',
    serviceInstances: '<',
    serviceToBind: '='
  },
  templateUrl: 'src/components/binding/bindApplicationForm.html',
  controller: function () {
    var ctrl = this;
  }
});
;'use strict';

angular.module('openshiftCommonUI').component('bindResults', {
  controllerAs: 'ctrl',
  bindings: {
    error: '<',
    binding: '<',
    progressInline: '@',
    serviceToBind: '<',
    applicationToBind: '<',
    showPodPresets: '<',
    secretHref: '<'
  },
  templateUrl: 'src/components/binding/bindResults.html',
  controller: function() {
    var ctrl = this;
    ctrl.$onInit = function () {
      ctrl.progressInline = ctrl.progressInline === 'true';
    };

    ctrl.$onChanges = function(onChangesObj) {
      if (onChangesObj.progressInline) {
        ctrl.progressInline = ctrl.progressInline === 'true';
      }
    }
  }
});


;'use strict';

angular.module('openshiftCommonUI').component('bindServiceForm', {
  controllerAs: 'ctrl',
  bindings: {
    serviceClass: '<',
    serviceClassName: '<',
    formName: '=',
    applications: '<',
    appToBind: '=',
    createBinding: '=?',
    allowNoBinding: '<?',
    shouldBindToApp: '=',
    groupByKind: '<'
  },
  templateUrl: 'src/components/binding/bindServiceForm.html',
  controller: function () {
    var ctrl = this;
  }
});
;"use strict";

angular.module("openshiftCommonUI")

  .directive("createProject", function($window) {
    return {
      restrict: 'E',
      scope: {
        alerts: '=',
        redirectAction: '&',
        onCancel: '&?',
        isDialog: '@'
      },
      templateUrl: 'src/components/create-project/createProject.html',
      controller: function($scope, $filter, $location, DataService, NotificationsService, displayNameFilter) {
        if(!($scope.submitButtonLabel)) {
          $scope.submitButtonLabel = 'Create';
        }

        $scope.isDialog = $scope.isDialog === 'true';

        var showAlert = function(name, alert) {
          $scope.alerts[name] = alert;
          NotificationsService.addNotification(alert);
        };

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
                showAlert('created-project', {
                  type: "success",
                    message: "Project \'"  + displayNameFilter(data) + "\' was successfully created."
                });
              }, function(result) {
                $scope.disableInputs = false;
                var data = result.data || {};
                if (data.reason === 'AlreadyExists') {
                  $scope.nameTaken = true;
                } else {
                  var msg = data.message || 'An error occurred creating the project.';
                  showAlert('error-creating-project', {type: 'error', message: msg});
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
      },
    };
  });
;'use strict';

angular.module("openshiftCommonUI")
  .directive("deleteProject", function ($uibModal, $location, $filter, $q, hashSizeFilter, APIService, DataService, NotificationsService, Logger) {
    return {
      restrict: "E",
      scope: {
        // The name of project to delete
        projectName: "@",
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
          NotificationsService.addNotification(alert.data);
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
                  message: formattedResource + " was marked for deletion."
                }
              });

              if (scope.success) {
                scope.success();
              }

              navigateToList();
            })
            .catch(function(err) {
              // called if failure to delete
              var alert = {
                type: "error",
                message: formattedResource + " could not be deleted.",
                details: $filter('getErrorDetails')(err)
              };
              NotificationsService.addNotification(alert);
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
      controller: function($scope, $filter, $location, DataService, NotificationsService, annotationNameFilter, displayNameFilter) {
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

        var showAlert = function(alert) {
          $scope.alerts["update"] = alert;
          NotificationsService.addNotification(alert);
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
              .then(function(project) {
                // angular is actually wrapping the redirect action :/
                var cb = $scope.redirectAction();
                if (cb) {
                  cb(encodeURIComponent($scope.project.metadata.name));
                }

                showAlert({
                  type: "success",
                  message: "Project \'"  + displayNameFilter(project) + "\' was successfully updated."
                });
              }, function(result) {
                $scope.disableInputs = false;
                $scope.editableFields = editableFields($scope.project);
                showAlert({
                  type: "error",
                  message: "An error occurred while updating the project",
                  details: $filter('getErrorDetails')(result)
                });
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
;'use strict';
// oscUnique is a validation directive
// use:
// Put it on an input or other DOM node with an ng-model attribute.
// Pass a list (array, or object) via osc-unique="list"
//
// Sets model $valid true||false
// - model is valid so long as the item is not already in the list
//
// Key off $valid to enable/disable/sow/etc other objects
//
// Validates that the ng-model is unique in a list of values.
// ng-model: 'foo'
// oscUnique: ['foo', 'bar', 'baz']       // false, the string 'foo' is in the list
// oscUnique: [1,2,4]                     // true, the string 'foo' is not in the list
// oscUnique: {foo: true, bar: false}     // false, the object has key 'foo'
// NOTES:
// - non-array values passed to oscUnqiue will be transformed into an array.
//   - oscUnqiue: 'foo' => [0,1,2]  (probably not what you want, so don't pass a string)
// - objects passed will be converted to a list of object keys.
//   - { foo: false } would still be invalid, because the key exists (value is ignored)
//   - recommended to pass an array
//
// Example:
// - prevent a button from being clickable if the input value has already been used
// <input ng-model="key" osc-unique="keys" />
// <button ng-disabled="form.key.$error.oscUnique" ng-click="submit()">Submit</button>
//
angular.module('openshiftCommonUI')
  .directive('oscUnique', function() {
    return {
      restrict: 'A',
      scope: {
        oscUnique: '='
      },
      require: 'ngModel',
      link: function($scope, $elem, $attrs, ctrl) {
        var list = [];

        $scope.$watchCollection('oscUnique', function(newVal) {
          list = _.isArray(newVal) ?
                    newVal :
                    _.keys(newVal);
        });

        ctrl.$parsers.unshift(function(value) {
          // is valid so long as it doesn't already exist
          ctrl.$setValidity('oscUnique', !_.includes(list, value));
          return value;
        });
      }
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
  .directive('tileClick', function() {
    return {
      restrict: 'AC',
      link: function($scope, element) {
        $(element).click(function (evt) {
          var t = $(evt.target);
          if (t && t.closest("a", element).length) {
            return;
          }
          $('a.tile-target', element).trigger("click");
        });
      }
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  .directive('toastNotifications', function(NotificationsService, $timeout) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'src/components/toast-notifications/toast-notifications.html',
      link: function($scope) {
        $scope.notifications = NotificationsService.getNotifications();

        $scope.close = function(notification) {
          notification.hidden = true;
          if (_.isFunction(notification.onClose)) {
            notification.onClose();
          }
        };
        $scope.onClick = function(notification, link) {
          if (_.isFunction(link.onClick)) {
            // If onClick() returns true, also hide the alert.
            var close = link.onClick();
            if (close) {
              notification.hidden = true;
            }
          }
        };
        $scope.setHover = function(notification, isHover) {
          notification.isHover = isHover;
        };

        $scope.$watch('notifications', function() {
          _.each($scope.notifications, function(notification) {
            if (NotificationsService.isAutoDismiss(notification) && !notification.hidden) {
              if (!notification.timerId) {
                notification.timerId = $timeout(function () {
                  notification.timerId = -1;
                  if (!notification.isHover) {
                    notification.hidden = true;
                  }
                }, NotificationsService.dismissDelay);
              } else if (notification.timerId === -1 && !notification.isHover) {
                notification.hidden = true;
              }
            }
          });
        }, true);
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
        // When expandable is on, optionally hide the collapse link so text can only be expanded. (Used for toast notifications.)
        hideCollapse: '=',
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

angular.module('openshiftCommonUI')
  .filter("alertStatus", function() {
    return function (type) {
      var status;

      switch(type) {
        case 'error':
          status = 'alert-danger';
          break;
        case 'warning':
          status = 'alert-warning';
          break;
        case 'success':
          status = 'alert-success';
          break;
        default:
          status = 'alert-info';
      }

      return status;
    };
  })
  .filter('alertIcon', function() {
    return function (type) {
      var icon;

      switch(type) {
        case 'error':
          icon = 'pficon pficon-error-circle-o';
          break;
        case 'warning':
          icon = 'pficon pficon-warning-triangle-o';
          break;
        case 'success':
          icon = 'pficon pficon-ok';
          break;
        default:
          icon = 'pficon pficon-info';
      }

      return icon;
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
      // Templates use simply `description` without a namespace.
      return annotationFilter(resource, 'openshift.io/description') ||
             annotationFilter(resource, 'kubernetes.io/description') ||
             annotationFilter(resource, 'description');
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
  })
  // gets the status condition that matches provided type
  // statusCondition(object, 'Ready')
  .filter('statusCondition', function() {
    return function(apiObject, type) {
      if (!apiObject) {
        return null;
      }

      return _.find(_.get(apiObject, 'status.conditions'), {type: type});
    };
  })
  .filter('isServiceInstanceReady', function(statusConditionFilter) {
    return function(apiObject) {
      return _.get(statusConditionFilter(apiObject, 'Ready'), 'status') === 'True';
    };
  })
  .filter('isBindingReady', function(isServiceInstanceReadyFilter) {
    return isServiceInstanceReadyFilter;
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
    return _.toArray;
  })
  .filter('size', function() {
    return _.size;
  })
  .filter('hashSize', function($log) {
    return function(hash) {
      if (!hash) {
        return 0;
      }
      return Object.keys(hash).length;
    };
  })
  // Wraps _.filter. Works with hashes, unlike ngFilter, which only works
  // with arrays.
  .filter('filterCollection', function() {
    return function(collection, predicate) {
      if (!collection || !predicate) {
        return collection;
      }
      return _.filter(collection, predicate);
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
  })
  .filter("getErrorDetails", function(upperFirstFilter) {
    return function(result, capitalize) {
      var error = result.data || {};
      if (error.message) {
        return capitalize ? upperFirstFilter(error.message) : error.message;
      }

      var status = result.status || error.status;
      if (status) {
        return "Status: " + status;
      }

      return "";
    };
  });
;'use strict';

angular.module('openshiftCommonUI').factory('GuidedTourService', function() {
  var hopscotchConfig = {};
  var innerConfig;
  var bubbleHeight = 175;

  var startTour = function(tourConfig, onTourEndCB) {
    $('body').append('<div id="guided_tour_backdrop" class="modal-backdrop fade guided-tour-backdrop"></div>');

    innerConfig = {
      onTourEndCB: onTourEndCB,
      bubblePadding: 5,
      arrowWidth: 10,
      onStart: handleTourStart,
      onEnd: handleTourEnd,
      onClose: handleTourEnd,
      showPrevButton: true,
      i18n: {
        nextBtn: 'Next >',
        prevBtn: '< Back'
      }
    };
    hopscotchConfig = {};
    angular.merge(hopscotchConfig, innerConfig, tourConfig);

    setupSteps();
    makeStepTargetVisible(0);

    hopscotch.startTour(hopscotchConfig, 0);
  };

  var cancelTour = function() {
    hopscotch.endTour();
  };

  function handleTourStart() {
    $('#guided_tour_backdrop').click(cancelTour);
  }

  function handleTourEnd() {
    $('#guided_tour_backdrop').remove();
    if (angular.isFunction(hopscotchConfig.onTourEndCB)) {
      hopscotchConfig.onTourEndCB();
    }
  }

  function setupSteps() {
    _.forEach(hopscotchConfig.steps, function(step) {
      step.onNextOrig = step.onNext;
      step.onPrevOrig = step.onPrev;
      step.onNext = onStepNext;
      step.onPrev = onStepPrev;
      step.fixedElement = true;

      // Since we use a title area, move up to get arrow out of title area
      if (angular.isUndefined(step.yOffset) && (step.placement === 'right' || step.placement === 'left' )) {
        step.yOffset = -45;
      }
    });
  }

  function onStepNext() {
    var stepNum = hopscotch.getCurrStepNum() - 1;
    var stepConfig = hopscotchConfig.steps[stepNum];

    if (stepConfig) {
      if (stepConfig.onNextOrig) {
        stepConfig.onNextOrig();
      }

      makeStepTargetVisible(stepNum + 1);
    }
  }

  function onStepPrev() {
    var stepNum = hopscotch.getCurrStepNum() + 1;
    var stepConfig = hopscotchConfig.steps[stepNum];

    if (stepConfig) {
      if (stepConfig.onPrevOrig) {
        stepConfig.onPrevOrig();
      }

      makeStepTargetVisible(stepNum - 1);
    }
  }

  function makeStepTargetVisible(stepNum) {
    var stepConfig = hopscotchConfig.steps[stepNum];

    if (!stepConfig) {
      return;
    }

    if (stepConfig.preShow) {
      stepConfig.preShow();
    }

    if (stepConfig.targetScrollElement) {
      var scrollElement = $('body').find(stepConfig.targetScrollElement)[0];
      var targetElement = $('body').find(stepConfig.target)[0];

      if (scrollElement && scrollElement) {

        var offsetTop = getOffsetTopFromScrollElement(targetElement, scrollElement);
        if (stepConfig.placement === 'top') {
          offsetTop -= bubbleHeight;
        } else {
          offsetTop += bubbleHeight;
        }

        if (offsetTop > scrollElement.clientHeight) {
          scrollElement.scrollTop = offsetTop;
        } else {
          scrollElement.scrollTop = 0;
        }
      }
    }
  }

  function getOffsetTopFromScrollElement(targetElement, scrollElement) {
    if (!targetElement || targetElement === scrollElement) {
      return 0;
    } else {
      return targetElement.offsetTop + getOffsetTopFromScrollElement(targetElement.offsetParent, scrollElement);
    }
  }

  return {
    startTour: startTour,
    cancelTour: cancelTour
  };
});
;'use strict';

angular.module('openshiftCommonUI').provider('NotificationsService', function() {
  this.dismissDelay = 8000;
  this.autoDismissTypes = ['info', 'success'];

  this.$get = function($rootScope) {
    var notifications = [];
    var dismissDelay = this.dismissDelay;
    var autoDismissTypes = this.autoDismissTypes;

    var notificationHiddenKey = function(notificationID, namespace) {
      if (!namespace) {
        return 'hide/notification/' + notificationID;
      }

      return 'hide/notification/' + namespace + '/' + notificationID;
    };

    var addNotification = function (notification) {
      if (isNotificationPermanentlyHidden(notification) || isNotificationVisible(notification)) {
        return;
      }

      notifications.push(notification);
    };

    var hideNotification = function (notificationID) {
      if (!notificationID) {
        return;
      }

      _.each(notifications, function(notification) {
        if (notification.id === notificationID) {
          notification.hidden = true;
        }
      });
    };

    var getNotifications = function () {
      return notifications;
    };

    var clearNotifications = function () {
      _.take(notifications, 0);
    };

    var isNotificationPermanentlyHidden = function (notification) {
      if (!notification.id) {
        return false;
      }

      var key = notificationHiddenKey(notification.id, notification.namespace);
      return localStorage.getItem(key) === 'true';
    };

    var permanentlyHideNotification = function (notificationID, namespace) {
      var key = notificationHiddenKey(notificationID, namespace);
      localStorage.setItem(key, 'true');
    };

    // Is there a visible toast notification with the same ID right now?
    var isNotificationVisible = function (notification) {
      if (!notification.id) {
        return false;
      }

      return _.some(notifications, function(next) {
        return !next.hidden && notification.id === next.id;
      });
    };

    var isAutoDismiss = function(notification) {
      return _.includes(autoDismissTypes, notification.type);
    };

    // Also handle `addNotification` events on $rootScope, which is used by DataService.
    $rootScope.$on('addNotification', function(event, data) {
      addNotification(data);
    });

    return {
      addNotification: addNotification,
      hideNotification: hideNotification,
      getNotifications: getNotifications,
      clearNotifications: clearNotifications,
      isNotificationPermanentlyHidden: isNotificationPermanentlyHidden,
      permanentlyHideNotification: permanentlyHideNotification,
      isAutoDismiss: isAutoDismiss,
      dismissDelay: dismissDelay,
      autoDismissTypes: autoDismissTypes
    };
  };

  this.setDismissDelay = function(delayInMs) {
    this.dismissDelay = delayInMs;
  };

  this.setAutoDismissTypes = function(arrayOfTypes) {
    this.autoDismissTypes = arrayOfTypes;
  };

});
