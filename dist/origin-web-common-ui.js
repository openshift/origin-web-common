/**
 * @name  openshiftCommonUI
 *
 * @description
 *   Base module for openshiftCommonUI.
 */
angular.module('openshiftCommonUI', [])
// Sometimes we need to know the css breakpoints, make sure to update this
// if they ever change!
.constant("BREAKPOINTS", {
  screenXsMin:  480,   // screen-xs
  screenSmMin:  768,   // screen-sm
  screenMdMin:  992,   // screen-md
  screenLgMin:  1200,  // screen-lg
  screenXlgMin: 1600   // screen-xlg
})
// DNS1123 subdomain patterns are used for name validation of many resources,
// including persistent volume claims, config maps, and secrets.
// See https://github.com/kubernetes/kubernetes/blob/master/pkg/api/validation/validation.go
.constant('DNS1123_SUBDOMAIN_VALIDATION', {
  pattern: /^[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/,
  maxlength: 253,
  description: 'Name must consist of lower-case letters, numbers, periods, and hyphens. It must start and end with a letter or a number.'
})
// http://stackoverflow.com/questions/9038625/detect-if-device-is-ios
.constant('IS_IOS', /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);


hawtioPluginLoader.addModule('openshiftCommonUI');
;angular.module('openshiftCommonUI').run(['$templateCache', function($templateCache) {
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
    "            {{ctrl.serviceClasses[serviceInstance.spec.clusterServiceClassRef.name].spec.externalMetadata.displayName || serviceInstance.spec.clusterServiceClassRef.name}}\n" +
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
    "<div ng-if=\"!ctrl.error && !(ctrl.binding | isBindingFailed)\">\n" +
    "  <div ng-if=\"ctrl.binding && !(ctrl.binding | isBindingReady)\" class=\"results-status\">\n" +
    "    <span class=\"fa fa-clock-o text-muted\" aria-hidden=\"true\"></span>\n" +
    "    <span class=\"sr-only\">Pending</span>\n" +
    "    <div class=\"results-message\">\n" +
    "      <h3>\n" +
    "        The binding is being created.\n" +
    "      </h3>\n" +
    "      <p class=\"results-message-details\">This may take several minutes.</p>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div ng-if=\"(ctrl.binding | isBindingReady)\">\n" +
    "    <div class=\"results-status\">\n" +
    "      <span class=\"pficon pficon-ok\" aria-hidden=\"true\"></span>\n" +
    "      <span class=\"sr-only\">Success</span>\n" +
    "      <div class=\"results-message\">\n" +
    "        <h3>\n" +
    "          <span ng-if=\"ctrl.bindType === 'application'\">\n" +
    "            <strong>{{ctrl.serviceToBind}}</strong> has been bound to\n" +
    "            <strong>{{ctrl.applicationToBind}}</strong> successfully.\n" +
    "          </span>\n" +
    "          <span ng-if=\"ctrl.bindType !== 'application'\">\n" +
    "            The binding <strong>{{ctrl.binding.metadata.name}}</strong> has been created successfully.\n" +
    "          </span>\n" +
    "        </h3>\n" +
    "        <p class=\"results-message-details\">\n" +
    "          The binding operation created the secret\n" +
    "          <a ng-if=\"ctrl.secretHref\" ng-href=\"{{ctrl.secretHref}}\">{{ctrl.binding.spec.secretName}}</a>\n" +
    "          <span ng-if=\"!ctrl.secretHref\">{{ctrl.binding.spec.secretName}}</span>\n" +
    "          that you may need to reference in your application.\n" +
    "          <span ng-if=\"ctrl.showPodPresets\">Its data will be available to your application as environment variables.</span>\n" +
    "        </p>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"alert alert-info results-info\" ng-if=\"ctrl.bindType === 'application'\">\n" +
    "      <span class=\"pficon pficon-info\" aria-hidden=\"true\"></span>\n" +
    "      <span class=\"sr-only\">Info</span>\n" +
    "      The binding secret will only be available to new pods. You will need to redeploy your application.\n" +
    "    </div>\n" +
    "  </div>\n" +
    "</div>\n" +
    "<div ng-if=\"ctrl.error || (ctrl.binding | isBindingFailed)\">\n" +
    "  <div class=\"results-status\">\n" +
    "    <span class=\"pficon pficon-error-circle-o text-danger\" aria-hidden=\"true\"></span>\n" +
    "    <span class=\"sr-only\">Error</span>\n" +
    "    <div class=\"results-message\">\n" +
    "      <h3>\n" +
    "        The binding could not be created.\n" +
    "      </h3>\n" +
    "    </div>\n" +
    "  </div>\n" +
    "  <div ng-if=\"ctrl.error\" class=\"sub-title\">\n" +
    "    <span ng-if=\"ctrl.error.data.message\">\n" +
    "      {{ctrl.error.data.message | upperFirst}}\n" +
    "    </span>\n" +
    "    <span ng-if=\"!ctrl.error.data.message\">\n" +
    "      An error occurred creating the binding.\n" +
    "    </span>\n" +
    "  </div>\n" +
    "  <div ng-if=\"!ctrl.error\" class=\"sub-title\">\n" +
    "    {{ctrl.binding | bindingFailedMessage}}\n" +
    "  </div>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/binding/bindServiceForm.html',
    "<div class=\"bind-form\">\n" +
    "  <form>\n" +
    "    <div class=\"form-group\">\n" +
    "      <label>\n" +
    "        <h3>Create a binding for <strong>{{ctrl.serviceClass.spec.externalMetadata.displayName || ctrl.serviceClass.spec.externalName}}</strong></h3>\n" +
    "      </label>\n" +
    "      <span class=\"help-block\">Bindings create a secret containing the necessary information for an application to use this service.</span>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "\n" +
    "  <form ng-if=\"ctrl.allowNoBinding || ctrl.showPodPresets\" name=\"ctrl.formName\" class=\"mar-bottom-lg\">\n" +
    "    <fieldset>\n" +
    "      <div class=\"radio\">\n" +
    "        <label ng-if=\"ctrl.showPodPresets\" class=\"bind-choice\" ng-disabled=\"!ctrl.applications.length\">\n" +
    "          <input type=\"radio\" ng-model=\"ctrl.bindType\" value=\"application\" ng-disabled=\"!ctrl.applications.length\">\n" +
    "          Create a secret and inject it into an application\n" +
    "        </label>\n" +
    "        <div ng-if=\"ctrl.showPodPresets\" class=\"application-select\">\n" +
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
    "    <div class=\"modal-header\">\n" +
    "      <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\" aria-label=\"Close\" ng-click=\"cancel()\">\n" +
    "        <span class=\"pficon pficon-close\"></span>\n" +
    "      </button>\n" +
    "      <h1 class=\"modal-title\">Are you sure you want to delete the project '<strong>{{project | displayName}}</strong>'?</h1>\n" +
    "    </div>\n" +
    "    <div class=\"modal-body\">\n" +
    "      <p>\n" +
    "        This will <strong>delete all resources</strong> associated with\n" +
    "        the project {{project | displayName}} and <strong>cannot be\n" +
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
    "      <button class=\"btn btn-default\" type=\"button\" ng-click=\"cancel()\">Cancel</button>\n" +
    "      <button ng-disabled=\"typeNameToConfirm && confirmName !== project.metadata.name && confirmName !== (project | displayName : false)\" class=\"btn btn-danger\" type=\"submit\" ng-click=\"delete()\">Delete</button>\n" +
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
    "  <div\n" +
    "    ng-repeat=\"(notificationID, notification) in notifications track by notification.trackByID\"\n" +
    "    ng-if=\"!notification.hidden || notification.isHover\"\n" +
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
    "\n" +
    "  highlightKeywords and linkify are mutually exclusive options\n" +
    "-->\n" +
    "<span ng-if=\"!truncated\">\n" +
    "  <span ng-if=\"!linkify || (highlightKeywords | size)\" ng-bind-html=\"content | highlightKeywords : keywords\" class=\"truncated-content\"></span>\n" +
    "  <span ng-if=\"linkify && !(highlightKeywords | size)\" ng-bind-html=\"content | linkify : '_blank'\" class=\"truncated-content\"></span>\n" +
    "</span>\n" +
    "<!-- To avoid truncating in middle of a link, we only optionally apply linkify to expanded content -->\n" +
    "<span ng-if=\"truncated\">\n" +
    "  <span ng-if=\"!toggles.expanded\">\n" +
    "    <span ng-attr-title=\"{{content}}\" class=\"truncation-block\">\n" +
    "      <span ng-bind-html=\"truncatedContent | highlightKeywords : keywords\" class=\"truncated-content\"></span>&hellip;\n" +
    "    </span>\n" +
    "    <a ng-if=\"expandable\" href=\"\" ng-click=\"toggles.expanded = true\" class=\"truncation-expand-link\">See All</a>\n" +
    "  </span>\n" +
    "  <span ng-if=\"toggles.expanded\">\n" +
    "    <span ng-if=\"!linkify || (highlightKeywords | size)\"\n" +
    "          ng-bind-html=\"content | highlightKeywords : keywords\"\n" +
    "          class=\"truncated-content\"></span>\n" +
    "    <span ng-if=\"linkify && !(highlightKeywords | size)\"\n" +
    "          ng-bind-html=\"content | linkify : '_blank'\"\n" +
    "          class=\"truncated-content\"></span>\n" +
    "    <a href=\"\" ng-if=\"!hideCollapse\" ng-click=\"toggles.expanded = false\" class=\"truncation-collapse-link\">Collapse</a>\n" +
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
  controller: function (BindingService) {
    var ctrl = this;
    ctrl.$onChanges = function (changeObj) {
      if (changeObj.serviceInstances || changeObj.serviceClasses) {
        ctrl.bindableServiceInstances = _.filter(ctrl.serviceInstances, isBindable);
      }
    };

    function isBindable(serviceInstance) {
      return BindingService.isServiceBindable(serviceInstance, ctrl.serviceClasses);
    }
  }
});
;'use strict';

angular.module('openshiftCommonUI').component('bindResults', {
  controllerAs: 'ctrl',
  bindings: {
    error: '<',
    binding: '<',
    serviceToBind: '<',
    bindType: '@',
    applicationToBind: '<',
    showPodPresets: '<',
    secretHref: '<'
  },
  templateUrl: 'src/components/binding/bindResults.html'
});
;'use strict';

angular.module('openshiftCommonUI').component('bindServiceForm', {
  controllerAs: 'ctrl',
  bindings: {
    serviceClass: '<',
    showPodPresets: '<',
    applications: '<',
    formName: '=',
    allowNoBinding: '<?',
    projectName: '<',
    bindType: '=', // One of: 'none', 'application', 'secret-only'
    appToBind: '=' // only applicable to 'application' bindType
  },
  templateUrl: 'src/components/binding/bindServiceForm.html',
  controller: function ($filter) {
    var ctrl = this;

    var humanizeKind = $filter('humanizeKind');
    ctrl.groupByKind = function(object) {
      return humanizeKind(object.kind);
    };
  }
});
;"use strict";

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
      controller: function($scope, $location, ProjectsService, NotificationsService, displayNameFilter, Logger) {
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
            var displayName = $scope.displayName || $scope.name;

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
                  var msg = data.message || "An error occurred creating project \'" + displayName + "\'.";
                  NotificationsService.addNotification({
                    type: 'error',
                    message: msg
                  });
                  Logger.error("Project \'" + displayName + "\' could not be created.", result);
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
;'use strict';

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
        submitButtonLabel: '@',
        redirectAction: '&',
        onCancel: '&',
        isDialog: '@'
      },
      templateUrl: 'src/components/edit-project/editProject.html',
      controller: function($scope,
                           $filter,
                           $location,
                           Logger,
                           NotificationsService,
                           ProjectsService,
                           annotationNameFilter,
                           displayNameFilter) {
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
            ProjectsService
              .update(
                $scope.project.metadata.name,
                cleanEditableAnnotations(mergeEditable($scope.project, $scope.editableFields)))
              .then(function(project) {
                // angular is actually wrapping the redirect action :/
                var cb = $scope.redirectAction();
                if (cb) {
                  cb(encodeURIComponent($scope.project.metadata.name));
                }

                NotificationsService.addNotification({
                  type: 'success',
                  message: "Project \'"  + displayNameFilter(project) + "\' was successfully updated."
                });
              }, function(result) {
                $scope.disableInputs = false;
                $scope.editableFields = editableFields($scope.project);
                NotificationsService.addNotification({
                  type: 'error',
                  message: "An error occurred while updating project \'" + displayNameFilter($scope.project) + "\'." ,
                  details: $filter('getErrorDetails')(result)
                });
                Logger.error("Project \'" + displayNameFilter($scope.project) + "\' could not be updated.", result);
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
;"use strict";

angular.module("openshiftCommonUI").component("originModalPopup", {
  transclude: true,
  bindings: {
    modalTitle: '@',
    shown: '<',
    position: '@', // 'top-left', 'top-right', 'bottom-left', or 'bottom-right' (default is 'bottom-right')
    referenceElement: '<?', // Optional reference element, default is parent element. Used to position popup based on screen position
    onClose: '<'
  },
  templateUrl: 'src/components/origin-modal-popup/origin-modal-popup.html',
  controller: function($scope, HTMLService, $element, $window) {
    var ctrl = this;
    var debounceResize;

    function updatePosition() {
      var positionElement = ctrl.referenceElement || $element[0].parentNode;

      if (positionElement && HTMLService.isWindowAboveBreakpoint(HTMLService.WINDOW_SIZE_SM)) {
        var posAbove = ctrl.position && ctrl.position.indexOf('top') > -1;
        var posLeft = ctrl.position && ctrl.position.indexOf('left') > -1;
        var topPos;
        var leftPos;
        var elementRect = positionElement.getBoundingClientRect();
        var windowHeight = $window.innerHeight;
        var modalElement = $element[0].children[0];
        var modalHeight = _.get(modalElement, 'offsetHeight', 0);
        var modalWidth = _.get(modalElement, 'offsetWidth', 0);

        // auto-adjust vertical position based on showing in the viewport
        if (elementRect.top < modalHeight) {
          posAbove = false;
        } else if (elementRect.bottom + modalHeight > windowHeight) {
          posAbove = true;
        }

        if (posAbove) {
          topPos = (elementRect.top - modalHeight) + 'px';
        } else {
          topPos = elementRect.bottom + 'px';
        }

        if (posLeft) {
          leftPos = elementRect.left + 'px';
        } else {
          leftPos = (elementRect.right - modalWidth) + 'px';
        }

        ctrl.showAbove = posAbove;
        ctrl.showLeft = posLeft;

        ctrl.positionStyle = {
          left: leftPos,
          top: topPos
        };
      } else {
        ctrl.positionStyle = {};
      }
    }

    function showModalBackdrop() {
      var backdropElement = '<div class="origin-modal-popup-backdrop modal-backdrop fade in tile-click-prevent"></div>';
      var parentNode = ctrl.referenceElement ? ctrl.referenceElement.parentNode : $element[0].parentNode;
      $(parentNode).append(backdropElement);
    }

    function hideModalBackdrop() {
      $('.origin-modal-popup-backdrop').remove();
    }

    function onWindowResize() {
      $scope.$evalAsync(updatePosition);
    }

    function onShow() {
      showModalBackdrop();
      debounceResize = _.debounce(onWindowResize, 50, { maxWait: 250 });
      angular.element($window).on('resize', debounceResize);
    }

    function onHide() {
      hideModalBackdrop();
      if (debounceResize) {
        angular.element($window).off('resize', debounceResize);
        debounceResize = null;
      }
    }

    ctrl.$onChanges = function (changeObj) {
      if (changeObj.shown) {
        if (ctrl.shown) {
          onShow();
        } else {
          onHide();
        }
      }

      if (changeObj.shown || changeObj.referenceElement) {
        if (ctrl.shown) {
          updatePosition();
        }
      }
    };

    ctrl.$onDestroy = function() {
      if (ctrl.shown) {
        onHide();
      }
    }
  }
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
        oscUnique: '=',
        oscUniqueDisabled: '='
      },
      require: 'ngModel',
      link: function($scope, $elem, $attrs, ctrl) {
        var list = [];
        var isUnique = true;

        $scope.$watchCollection('oscUnique', function(newVal) {
          list = _.isArray(newVal) ?
                    newVal :
                    _.keys(newVal);
        });

        var updateValidity = function() {
          ctrl.$setValidity('oscUnique', $scope.oscUniqueDisabled || isUnique);
        };

        $scope.$watch('oscUniqueDisabled', updateValidity);

        ctrl.$parsers.unshift(function(value) {
          isUnique = !_.includes(list, value);
          updateValidity();
          return value;
        });
      }
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  // This triggers when an element has either a toggle or data-toggle attribute set on it
  .directive('toggle', function(IS_IOS) {
    // Sets the CSS cursor value on the document body to allow dismissing the tooltips on iOS.
    // See https://github.com/twbs/bootstrap/issues/16028#issuecomment-236269114
    var setCursor = function(cursor) {
      $('body').css('cursor', cursor);
    };
    var setCursorPointer = _.partial(setCursor, 'pointer');
    var setCursorAuto = _.partial(setCursor, 'auto');
    if (IS_IOS) {
      $(document).on('shown.bs.popover', setCursorPointer);
      $(document).on('shown.bs.tooltip', setCursorPointer);
      $(document).on('hide.bs.popover', setCursorAuto);
      $(document).on('hide.bs.tooltip', setCursorAuto);
    }

    return {
      restrict: 'A',
      scope: {
        dynamicContent: '@?'
      },
      link: function($scope, element, attrs) {
        var popupConfig = {
          container: attrs.container || "body",
          placement: attrs.placement || "auto"
        };
        if (attrs) {
          switch(attrs.toggle) {
            case "popover":
              // If dynamic-content attr is set at all, even if it hasn't evaluated to a value
              if (attrs.dynamicContent || attrs.dynamicContent === "") {
                $scope.$watch('dynamicContent', function() {
                  $(element).popover("destroy");
                  // Destroy is asynchronous. Wait for it to complete before updating content.
                  // See https://github.com/twbs/bootstrap/issues/16376
                  //     https://github.com/twbs/bootstrap/issues/15607
                  //     http://stackoverflow.com/questions/27238938/bootstrap-popover-destroy-recreate-works-only-every-second-time
                  // Destroy calls hide, which takes 150ms to complete.
                  //     https://github.com/twbs/bootstrap/blob/87121181c8a4b63192865587381d4b8ada8de30c/js/tooltip.js#L31
                  setTimeout(function() {
                    $(element)
                      .attr("data-content", $scope.dynamicContent)
                      .popover(popupConfig);
                  }, 200);
                });
              }
              $(element).popover(popupConfig);
              $scope.$on('$destroy', function(){
                $(element).popover("destroy");
              });
              break;
            case "tooltip":
              // If dynamic-content attr is set at all, even if it hasn't evaluated to a value
              if (attrs.dynamicContent || attrs.dynamicContent === "") {
                $scope.$watch('dynamicContent', function() {
                  $(element).tooltip("destroy");
                  // Destroy is asynchronous. Wait for it to complete before updating content.
                  // See https://github.com/twbs/bootstrap/issues/16376
                  //     https://github.com/twbs/bootstrap/issues/15607
                  //     http://stackoverflow.com/questions/27238938/bootstrap-popover-destroy-recreate-works-only-every-second-time
                  // Destroy calls hide, which takes 150ms to complete.
                  //     https://github.com/twbs/bootstrap/blob/87121181c8a4b63192865587381d4b8ada8de30c/js/tooltip.js#L31
                  setTimeout(function() {
                    $(element)
                      .attr("title", $scope.dynamicContent)
                      .tooltip(popupConfig);
                  }, 200);
                });
              }
              $(element).tooltip(popupConfig);
              $scope.$on('$destroy', function(){
                $(element).tooltip("destroy");
              });
              break;
            case "dropdown":
              if (attrs.hover === "dropdown") {
                $(element).dropdownHover({delay: 200});
                $(element).dropdown();
              }
              break;
          }
        }
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
          // Don't trigger tile target if the user clicked directly on a link or button inside the tile or any child of a .tile-click-prevent element.
          var t = $(evt.target);
          if (t && (t.closest("a", element).length || t.closest("button", element).length) || t.closest(".tile-click-prevent", element).length) {
            return;
          }
          angular.element($('a.tile-target', element))[0].click();
        });
      }
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  .directive('toastNotifications', function(NotificationsService, $rootScope, $timeout) {
    return {
      restrict: 'E',
      scope: {},
      templateUrl: 'src/components/toast-notifications/toast-notifications.html',
      link: function($scope) {
        $scope.notifications = [];

        // A notification is removed if it has hidden set and the user isn't
        // currently hovering over it.
        var isRemoved = function(notification) {
          return notification.hidden && !notification.isHover;
        };

        var removeNotification = function(notification) {
          notification.isHover = false;
          notification.hidden = true;
        };

        // Remove items that are now hidden to keep the array from growing
        // indefinitely. We loop over the entire array each digest loop, even
        // if everything is hidden, and any watch update triggers a new digest
        // loop. If the array grows large, it can hurt performance.
        var pruneRemovedNotifications = function() {
          $scope.notifications = _.reject($scope.notifications, isRemoved);
        };

        $scope.close = function(notification) {
          removeNotification(notification);
          if (_.isFunction(notification.onClose)) {
            notification.onClose();
          }
        };

        $scope.onClick = function(notification, link) {
          if (_.isFunction(link.onClick)) {
            // If onClick() returns true, also hide the alert.
            var close = link.onClick();
            if (close) {
              removeNotification(notification);
            }
          }
        };

        $scope.setHover = function(notification, isHover) {
          // Don't change anything if the notification was already removed.
          // Avoids a potential issue where the flag is reset during the slide
          // out animation.
          if (!isRemoved(notification)) {
            notification.isHover = isHover;
          }
        };

        // Listen for updates from NotificationsService to show a notification.
        var deregisterNotificationListener = $rootScope.$on('NotificationsService.onNotificationAdded', function(event, notification) {
          if (notification.skipToast) {
            return;
          }
          $scope.$evalAsync(function() {
            $scope.notifications.push(notification);
            if (NotificationsService.isAutoDismiss(notification)) {
              $timeout(function () {
                notification.hidden = true;
              }, NotificationsService.dismissDelay);
            }

            // Whenever we add a new notification, also remove any hidden toasts
            // so that the array doesn't grow indefinitely.
            pruneRemovedNotifications();
          });
        });

        $scope.$on('$destroy', function() {
          if (deregisterNotificationListener) {
            deregisterNotificationListener();
            deregisterNotificationListener = null;
          }
        });
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
        linkify: '=?'
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
    return function(type) {
      type = type || '';
      // API events have just two types: Normal, Warning
      // our notifications have four: info, success, error, and warning
      switch(type.toLowerCase()) {
        case 'error':
          return 'alert-danger';
        case 'warning':
          return 'alert-warning';
        case 'success':
          return 'alert-success';
        case 'normal':
          return 'alert-info';
      }

      return 'alert-info';
    };
  })
  .filter('alertIcon', function() {
    return function(type) {
      type = type || '';

      // API events have just two types: Normal, Warning
      // our notifications have four: info, success, error, and warning
      switch(type.toLowerCase()) {
        case 'error':
          return 'pficon pficon-error-circle-o';
        case 'warning':
          return 'pficon pficon-warning-triangle-o';
        case 'success':
          return 'pficon pficon-ok';
        case 'normal':
          return 'pficon pficon-info';
      }

      return 'pficon pficon-info';
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
      "loggingUIHostname":        ["openshift.io/logging.ui.hostname"],
      "loggingDataPrefix":        ["openshift.io/logging.data.prefix"],
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
        for(var i=0; i < _.size(tags); ++i){
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
  // Returns an image URL for an icon class if available. Some icons we have
  // color SVG images for. Depends on window.OPENSHIFT_CONSTANTS.LOGOS and
  // window.OPENSHIFT_CONSTANTS.LOGO_BASE_URL, which is set by origin-web-console
  // (or an extension).
  .filter('imageForIconClass', function($window, isAbsoluteURLFilter) {
    return function(iconClass) {
      if (!iconClass) {
        return '';
      }

      var logoImage = _.get($window, ['OPENSHIFT_CONSTANTS', 'LOGOS', iconClass]);
      if (!logoImage) {
        return '';
      }

      // Make sure the logo base has a trailing slash.
      var logoBaseUrl = _.get($window, 'OPENSHIFT_CONSTANTS.LOGO_BASE_URL');
      if (!logoBaseUrl || isAbsoluteURLFilter(logoImage)) {
        return logoImage;
      }

      if (!_.endsWith(logoBaseUrl, '/')) {
        logoBaseUrl += '/';
      }

      return logoBaseUrl + logoImage;
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
  .filter('isAbsoluteURL', function() {
    return function(url) {
      if (!url || !_.isString(url)) {
        return false;
      }
      var uri = new URI(url);
      var protocol = uri.protocol();
      return uri.is('absolute') && (protocol === 'http' || protocol === 'https');
    };
  });
;'use strict';

angular.module('openshiftCommonUI')
// Usage: <span ng-bind-html="text | linkify : '_blank'"></span>
//
// Prefer this to the AngularJS `linky` filter since it only matches http and
// https URLs. We've had issues with incorretly matching email addresses.
//
// https://github.com/openshift/origin-web-console/issues/315
// See also HTMLService.linkify
.filter('linkify', function(HTMLService) {
  return function(text, target, alreadyEscaped) {
    return HTMLService.linkify(text, target, alreadyEscaped);
  };
});
;'use strict';

angular.module("openshiftCommonUI")
  .filter("normalizeIconClass", function() {
    return function(iconClass) {
      // if iconClass starts with "icon-", append "font-icon "
      // so the Openshift Logos Icon font is used
      if(_.startsWith(iconClass, "icon-")) {
        return "font-icon " + iconClass;
      } else {
        return iconClass;
      }
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
  .filter('preferredVersion', function(APIService) {
    return APIService.getPreferredVersion;
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

      if (kind === 'ServiceInstance') {
        return useTitleCase ? 'Provisioned Service' : 'provisioned service';
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
  .filter('serviceInstanceReadyMessage', function(statusConditionFilter) {
    return function(apiObject) {
      return _.get(statusConditionFilter(apiObject, 'Ready'), 'message');
    };
  })
  .filter('isServiceInstanceFailed', function(statusConditionFilter) {
    return function(apiObject) {
      return _.get(statusConditionFilter(apiObject, 'Failed'), 'status') === 'True';
    };
  })
  .filter('serviceInstanceFailedMessage', function(isServiceInstanceFailedFilter, statusConditionFilter) {
    return function(apiObject) {
      if (isServiceInstanceFailedFilter(apiObject)) {
        return _.get(statusConditionFilter(apiObject, 'Failed'), 'message');
      }
    };
  })
  .filter('isBindingReady', function(isServiceInstanceReadyFilter) {
    return isServiceInstanceReadyFilter;
  })
  .filter('isBindingFailed', function(isServiceInstanceFailedFilter) {
    return isServiceInstanceFailedFilter;
  })
  .filter('bindingFailedMessage', function(serviceInstanceFailedMessageFilter) {
    return serviceInstanceFailedMessageFilter;
  })
  .filter('bindingReadyMessage', function(serviceInstanceReadyMessageFilter) {
    return serviceInstanceReadyMessageFilter;
  })
  .filter('hasDeployment', function(annotationFilter) {
    return function(object) {
      return !!annotationFilter(object, 'deployment.kubernetes.io/revision');
    };
  })
  .filter('hasDeploymentConfig', function(annotationFilter) {
    return function(deployment) {
      return !!annotationFilter(deployment, 'deploymentConfig');
    };
  })
  .filter('serviceClassDisplayName', function() {
    return function(serviceClass) {
      var serviceClassDisplayName = _.get(serviceClass, 'spec.externalMetadata.displayName');
      if (serviceClassDisplayName) {
        return serviceClassDisplayName;
      }

      return _.get(serviceClass, 'spec.externalName');
    };
  })
  .filter('serviceInstanceDisplayName', function(serviceClassDisplayNameFilter) {
    return function(instance, serviceClass) {
      if (serviceClass) {
        return serviceClassDisplayNameFilter(serviceClass);
      }

      var serviceClassExternalName = _.get(instance, 'spec.clusterServiceClassExternalName');
      if (serviceClassExternalName) {
        return serviceClassExternalName;
      }

      return _.get(instance, 'metadata.name');
    };
  })
  .filter('serviceInstanceStatus', function(isServiceInstanceReadyFilter) {
    return function(instance) {
      var status = 'Pending';
      var conditions = _.get(instance, 'status.conditions');
      var instanceError = _.find(conditions, {type: 'Failed', status: 'True'});

      if (instanceError) {
        status = 'Failed';
      } else if (isServiceInstanceReadyFilter(instance)) {
        status = 'Ready';
      }

      return status;
    };
  })
;
;'use strict';
angular.module('openshiftCommonUI')
  .filter('camelToLower', function() {
    return function(str) {
      if (!str) {
        return '';
      }

      // Use the special logic in _.startCase to handle camel case strings, kebab
      // case strings, snake case strings, etc.
      return _.startCase(str).toLowerCase();
    };
  })
  .filter('upperFirst', function() {
    // Uppercase the first letter of a string (without making any other changes).
    // Different than `capitalize` because it doesn't lowercase other letters.
    return _.upperFirst;
  })
  .filter('sentenceCase', function(camelToLowerFilter) {
    // Converts a camel case string to sentence case
    return function(str) {
      var lower = camelToLowerFilter(str);
      return _.upperFirst(lower);
    };
  })
  .filter('startCase', function () {
    return _.startCase;
  })
  .filter('capitalize', function() {
    return _.capitalize;
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
      if (typeof str !== 'string') {
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

        var startIndex = Math.max(4, charLimit - 10);
        var lastSpace = truncated.lastIndexOf(' ');
        if (lastSpace >= startIndex && lastSpace !== -1) {
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
  .filter('hashSize', function() {
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
      if (!result) {
        return "";
      }

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
        prevBtn: '< Back',
        closeTooltip: 'x'  // this is the button text not a tooltip, hidden but must be 1 character for focus border (cannot but empty or null)
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

      step.title = _.isFunction(step.title) ? step.title() : step.title;
      step.content = _.isFunction(step.content) ? step.content() : step.content;
      step.target = _.isFunction(step.target) ? step.target() : step.target;
      step.placement = _.isFunction(step.placement) ? step.placement() : step.placement;
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

angular.module("openshiftCommonUI")
  .factory("HTMLService", function(BREAKPOINTS) {
    var WINDOW_SIZE_XXS = 'xxs';
    var WINDOW_SIZE_XS = 'xs';
    var WINDOW_SIZE_SM = 'sm';
    var WINDOW_SIZE_MD = 'md';
    var WINDOW_SIZE_LG = 'lg';

    return {
      WINDOW_SIZE_XXS: WINDOW_SIZE_XXS,
      WINDOW_SIZE_XS: WINDOW_SIZE_XS,
      WINDOW_SIZE_SM: WINDOW_SIZE_SM,
      WINDOW_SIZE_MD: WINDOW_SIZE_MD,
      WINDOW_SIZE_LG: WINDOW_SIZE_LG,

      // Ge the breakpoint for the current screen width.
      getBreakpoint: function() {
        if (window.innerWidth < BREAKPOINTS.screenXsMin) {
          return WINDOW_SIZE_XXS;
        }

        if (window.innerWidth < BREAKPOINTS.screenSmMin) {
          return WINDOW_SIZE_XS;
        }

        if (window.innerWidth < BREAKPOINTS.screenMdMin) {
          return WINDOW_SIZE_SM;
        }

        if (window.innerWidth < BREAKPOINTS.screenLgMin) {
          return WINDOW_SIZE_MD;
        }

        return WINDOW_SIZE_LG;
      },

      isWindowBelowBreakpoint: function(size) {
        switch(size) {
          case WINDOW_SIZE_XXS:
            return false; // Nothing is below xxs
          case WINDOW_SIZE_XS:
            return window.innerWidth < BREAKPOINTS.screenXsMin;
          case WINDOW_SIZE_SM:
            return window.innerWidth < BREAKPOINTS.screenSmMin;
          case WINDOW_SIZE_MD:
            return window.innerWidth < BREAKPOINTS.screenMdMin;
          case WINDOW_SIZE_LG:
            return window.innerWidth < BREAKPOINTS.screenLgMin;
          default:
            return true;
        }
      },

      isWindowAboveBreakpoint: function(size) {
        switch(size) {
          case WINDOW_SIZE_XS:
            return window.innerWidth >= BREAKPOINTS.screenXsMin;
          case WINDOW_SIZE_SM:
            return window.innerWidth >= BREAKPOINTS.screenSmMin;
          case WINDOW_SIZE_MD:
            return window.innerWidth >= BREAKPOINTS.screenMdMin;
          case WINDOW_SIZE_LG:
            return window.innerWidth >= BREAKPOINTS.screenLgMin;
          default:
            return true;
        }
      },

      // Based on https://github.com/drudru/ansi_up/blob/v1.3.0/ansi_up.js#L93-L97
      // and https://github.com/angular/angular.js/blob/v1.5.8/src/ngSanitize/filter/linky.js#L131-L132
      // The AngularJS `linky` regex will avoid matching special characters like `"` at
      // the end of the URL.
      //
      // text:            The text to linkify. Assumes `text` is NOT HTML-escaped unless
      //                  `alreadyEscaped` is true.
      // target:          The optional link target (for instance, '_blank')
      // alreadyEscaped:  `true` if the text has already been HTML escaped
      //                  (like log content that has been run through ansi_up.ansi_to_html)
      //
      // Returns an HTML escaped string with http:// and https:// URLs changed to clickable links.
      linkify: function(text, target, alreadyEscaped) {
        if (!text) {
          return text;
        }

        // First HTML escape the content.
        if (!alreadyEscaped) {
          text = _.escape(text);
        }

        // Replace any URLs with links.
        return text.replace(/https?:\/\/[A-Za-z0-9._%+-]+[^\s<]*[^\s.,()\[\]{}<>"\u201d\u2019]/gm, function(str) {
          if (target) {
            return "<a href=\"" + str + "\" target=\"" + target + "\">" + str + " <i class=\"fa fa-external-link\" aria-hidden=\"true\"></i></a>";
          }

          return "<a href=\"" + str + "\">" + str + "</a>";
        });
      }
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
      // notifications may already have an id that is not necessarily unique,
      // this is an explicitly unique id just for `track by` in templates
      notification.trackByID = _.uniqueId('notification-') + Date.now();
      notification.skipToast = notification.skipToast || false;
      notification.showInDrawer = notification.showInDrawer || false;
      notification.timestamp = new Date().toISOString();
      if (isNotificationPermanentlyHidden(notification) || isNotificationVisible(notification)) {
        return;
      }

      notifications.push(notification);
      $rootScope.$emit('NotificationsService.onNotificationAdded', notification);
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
      notifications.length = 0;
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
    $rootScope.$on('NotificationsService.addNotification', function(event, data) {
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
