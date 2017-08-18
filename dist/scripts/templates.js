angular.module('openshiftCommonUI').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('src/components/binding/bindApplicationForm.html',
    "<div class=\"bind-form\">\n" +
    "  <form>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label>\n" +
    "        <h3>Create a binding for application <strong>{{ctrl.applicationName}}</strong></h3>\n" +
    "      </label>\n" +
    "      <span class=\"help-block\">\n" +
    "        Bindings create a secret containing the necessary information for an application to use a service.\n" +
    "      </span>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "\n" +
    "  <label ng-if=\"!ctrl.allowNoBinding\">\n" +
    "    Select a service:\n" +
    "  </label>\n" +
    "  <form name=\"ctrl.formName\">\n" +
    "    <fieldset>\n" +
    "      <div class=\"radio\">\n" +
    "        <div ng-if=\"ctrl.allowNoBinding\" class=\"bind-service-selection\">\n" +
    "          <label>\n" +
    "            <input type=\"radio\" ng-model=\"ctrl.serviceToBind\" ng-value=\"null\">\n" +
    "            Do not bind at this time.\n" +
    "          </label>\n" +
    "          <div class=\"bind-description\">\n" +
    "          <span class=\"help-block service-instance-name\">\n" +
    "            Bindings can be created later from within a project.\n" +
    "          </span>\n" +
    "          </div>\n" +
    "        </div>\n" +
    "        <div ng-repeat=\"serviceInstance in ctrl.bindableServiceInstances\" class=\"bind-service-selection\">\n" +
    "          <label>\n" +
    "            <input type=\"radio\" ng-model=\"ctrl.serviceToBind\" ng-value=\"serviceInstance\">\n" +
    "            {{ctrl.serviceClasses[serviceInstance.spec.serviceClassName].externalMetadata.displayName || serviceInstance.spec.serviceClassName}}\n" +
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
    "        <h4 ng-if=\"!ctrl.bindableServiceInstances.length\">\n" +
    "          <span class=\"pficon pficon-info\" aria-hidden=\"true\"></span>\n" +
    "          <span class=\"help-block service-instance-name\">\n" +
    "            There are no bindable services in this project\n" +
    "          </span>\n" +
    "        </h4>\n" +
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
    "        <span>has been bound</span>\n" +
    "        <span ng-if=\"ctrl.bindType === 'application'\"> to <strong>{{ctrl.applicationToBind}}</strong> successfully</span>\n" +
    "      </h3>\n" +
    "    </div>\n" +
    "    <div class=\"sub-title\">\n" +
    "      The binding operation created the secret\n" +
    "      <a ng-if=\"ctrl.secretHref && 'secrets' | canI : 'list'\"\n" +
    "         ng-href=\"{{ctrl.secretHref}}\">{{ctrl.binding.spec.secretName}}</a>\n" +
    "      <a ng-if=\"!ctrl.secretHref || !('secrets' | canI : 'list')\"\n" +
    "         ng-href=\"{{ctrl.secretHref}}\">{{ctrl.binding.spec.secretName}}</a>\n" +
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
    "          <h3>Create a binding for <strong>{{ctrl.serviceClass.externalMetadata.displayName || ctrl.serviceClassName}}</strong></h3>\n" +
    "        </label>\n" +
    "        <span class=\"help-block\">Bindings create a secret containing the necessary information for an application to use this service.</span>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "\n" +
    "  <form name=\"ctrl.formName\" class=\"mar-bottom-lg\">\n" +
    "    <fieldset>\n" +
    "      <div class=\"radio\">\n" +
    "        <label class=\"bind-choice\" ng-disabled=\"!ctrl.applications.length\">\n" +
    "          <input type=\"radio\" ng-model=\"ctrl.bindType\" value=\"application\" ng-disabled=\"!ctrl.applications.length\">\n" +
    "          Create a secret and inject it into an application\n" +
    "        </label>\n" +
    "        <div class=\"application-select\">\n" +
    "          <ui-select ng-model=\"ctrl.appToBind\"\n" +
    "                     ng-disabled=\"ctrl.bindType !== 'application'\"\n" +
    "                     ng-required=\"ctrl.bindType === 'application'\">\n" +
    "            <ui-select-match placeholder=\"{{ctrl.applications.length ? 'Select an application' : 'There are no applications in this project'}}\">\n" +
    "              <span>\n" +
    "                {{$select.selected.metadata.name}}\n" +
    "                <small class=\"text-muted\">&ndash; {{$select.selected.kind | humanizeKind : true}}</small>\n" +
    "              </span>\n" +
    "            </ui-select-match>\n" +
    "            <ui-select-choices\n" +
    "              repeat=\"application in (ctrl.applications) | filter : { metadata: { name: $select.search } } track by (application | uid)\"\n" +
    "              group-by=\"ctrl.groupByKind\">\n" +
    "              <span ng-bind-html=\"application.metadata.name | highlight : $select.search\"></span>\n" +
    "            </ui-select-choices>\n" +
    "          </ui-select>\n" +
    "        </div>\n" +
    "        <label class=\"bind-choice\">\n" +
    "          <input type=\"radio\" ng-model=\"ctrl.bindType\" value=\"secret-only\">\n" +
    "          Create a secret in <strong>{{ctrl.projectName}}</strong> to be used later\n" +
    "        </label>\n" +
    "        <div class=\"help-block bind-description\">\n" +
    "          Secrets can be referenced later from an application.\n" +
    "        </div>\n" +
    "        <label ng-if=\"ctrl.allowNoBinding\" class=\"bind-choice\">\n" +
    "          <input type=\"radio\" ng-model=\"ctrl.bindType\" value=\"none\">\n" +
    "          Do not bind at this time\n" +
    "        </label>\n" +
    "        <div ng-if=\"ctrl.allowNoBinding\" class=\"help-block bind-description\">\n" +
    "          Bindings can be created later from within a project.\n" +
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
    "        <input class=\"form-control\"\n" +
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
    "      <input class=\"form-control\"\n" +
    "          name=\"displayName\"\n" +
    "          id=\"displayName\"\n" +
    "          placeholder=\"My Project\"\n" +
    "          type=\"text\"\n" +
    "          ng-model=\"displayName\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"description\">Description</label>\n" +
    "      <textarea class=\"form-control\"\n" +
    "          name=\"description\"\n" +
    "          id=\"description\"\n" +
    "          placeholder=\"A short description.\"\n" +
    "          ng-model=\"description\"></textarea>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"button-group\">\n" +
    "      <button type=\"submit\"\n" +
    "          class=\"btn btn-primary\"\n" +
    "          ng-class=\"{'dialog-btn': isDialog}\"\n" +
    "          ng-click=\"createProject()\"\n" +
    "          ng-disabled=\"createProjectForm.$invalid || nameTaken || disableInputs\"\n" +
    "          value=\"\">\n" +
    "        Create\n" +
    "      </button>\n" +
    "      <button\n" +
    "          class=\"btn btn-default\"\n" +
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
    "      <input class=\"form-control\"\n" +
    "             name=\"displayName\"\n" +
    "             id=\"displayName\"\n" +
    "             placeholder=\"My Project\"\n" +
    "             type=\"text\"\n" +
    "             ng-model=\"editableFields.displayName\">\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"form-group\">\n" +
    "      <label for=\"description\">Description</label>\n" +
    "                    <textarea class=\"form-control\"\n" +
    "                              name=\"description\"\n" +
    "                              id=\"description\"\n" +
    "                              placeholder=\"A short description.\"\n" +
    "                              ng-model=\"editableFields.description\"></textarea>\n" +
    "    </div>\n" +
    "\n" +
    "    <div class=\"button-group\">\n" +
    "      <button type=\"submit\"\n" +
    "              class=\"btn btn-primary\"\n" +
    "              ng-class=\"{'dialog-btn': isDialog}\"\n" +
    "              ng-click=\"update()\"\n" +
    "              ng-disabled=\"editProjectForm.$invalid || disableInputs\"\n" +
    "              value=\"\">{{submitButtonLabel}}</button>\n" +
    "      <button\n" +
    "          class=\"btn btn-default\"\n" +
    "          ng-class=\"{'dialog-btn': isDialog}\"\n" +
    "          ng-click=\"cancelEditProject()\">\n" +
    "        Cancel\n" +
    "      </button>\n" +
    "    </div>\n" +
    "  </fieldset>\n" +
    "</form>\n"
  );


  $templateCache.put('src/components/origin-modal-popup/origin-modal-popup.html',
    "<div class=\"origin-modal-popup tile-click-prevent\" ng-if=\"$ctrl.shown\" ng-style=\"$ctrl.positionStyle\"\n" +
    "     ng-class=\"{'position-above': $ctrl.showAbove, 'position-left': $ctrl.showLeft}\">\n" +
    "  <h4 class=\"origin-modal-popup-title\">\n" +
    "    {{$ctrl.modalTitle}}\n" +
    "  </h4>\n" +
    "  <div ng-transclude></div>\n" +
    "  <a href=\"\" class=\"origin-modal-popup-close\" ng-click=\"$ctrl.onClose()\">\n" +
    "    <span class=\"pficon pficon-close\"></span>\n" +
    "  </a>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/toast-notifications/toast-notifications.html',
    "<div class=\"toast-notifications-list-pf\">\n" +
    "  <div ng-repeat=\"(notificationID, notification) in notifications track by (notificationID + (notification.message || notification.details))\" ng-if=\"!notification.hidden || notification.isHover\"\n" +
    "       ng-mouseenter=\"setHover(notification, true)\" ng-mouseleave=\"setHover(notification, false)\">\n" +
    "    <div class=\"toast-pf alert {{notification.type | alertStatus}}\" ng-class=\"{'alert-dismissable': !hideCloseButton}\">\n" +
    "      <button ng-if=\"!hideCloseButton\" type=\"button\" class=\"close\" ng-click=\"close(notification)\">\n" +
    "        <span class=\"pficon pficon-close\" aria-hidden=\"true\"></span>\n" +
    "        <span class=\"sr-only\">Close</span>\n" +
    "      </button>\n" +
    "      <span class=\"{{notification.type | alertIcon}}\" aria-hidden=\"true\"></span>\n" +
    "      <span class=\"sr-only\">{{notification.type}}</span>\n" +
    "      <span class=\"toast-notification-message\" ng-if=\"notification.message\">{{notification.message}}</span>\n" +
    "      <div ng-if=\"notification.details\" class=\"toast-notification-details\">\n" +
    "        <truncate-long-text\n" +
    "          limit=\"200\"\n" +
    "          content=\"notification.details\"\n" +
    "          use-word-boundary=\"true\"\n" +
    "          expandable=\"true\"\n" +
    "          hide-collapse=\"true\">\n" +
    "        </truncate-long-text>\n" +
    "      </div>\n" +
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
