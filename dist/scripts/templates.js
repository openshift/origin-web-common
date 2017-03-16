angular.module('openshiftCommonUI').run(['$templateCache', function($templateCache) {
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


  $templateCache.put('src/components/delete-link/delete-button.html',
    "<div class=\"actions\">\n" +
    "  <!-- Avoid whitespace inside the link -->\n" +
    "  <a href=\"\"\n" +
    "     ng-click=\"$event.stopPropagation(); openDeleteModal()\"\n" +
    "     role=\"button\"\n" +
    "     class=\"action-button\"\n" +
    "     ng-attr-aria-disabled=\"{{disableDelete ? 'true' : undefined}}\"\n" +
    "     ng-class=\"{ 'disabled-link': disableDelete }\"\n" +
    "    ><i class=\"fa fa-trash-o\" aria-hidden=\"true\"\n" +
    "    ></i><span class=\"sr-only\">Delete {{kind | humanizeKind}} {{resourceName}}</span></a>\n" +
    "</div>\n"
  );


  $templateCache.put('src/components/delete-link/delete-link.html',
    "<a href=\"javascript:void(0)\"\n" +
    "   ng-click=\"openDeleteModal()\"\n" +
    "   role=\"button\"\n" +
    "   ng-attr-aria-disabled=\"{{disableDelete ? 'true' : undefined}}\"\n" +
    "   ng-class=\"{ 'disabled-link': disableDelete }\"\n" +
    ">{{label || 'Delete'}}</a>\n"
  );


  $templateCache.put('src/components/delete-link/delete-resource.html',
    "<div class=\"delete-resource-modal\">\n" +
    "  <!-- Use a form so that the enter key submits when typing a project name to confirm. -->\n" +
    "  <form>\n" +
    "    <div class=\"modal-body\">\n" +
    "      <h1>Are you sure you want to delete the {{typeDisplayName || (kind | humanizeKind)}}\n" +
    "        '<strong>{{displayName ? displayName : resourceName}}</strong>'?</h1>\n" +
    "      <div ng-if=\"replicas\" class=\"alert alert-warning\">\n" +
    "        <span class=\"pficon pficon-warning-triangle-o\" aria-hidden=\"true\"></span>\n" +
    "        <span class=\"sr-only\">Warning:</span>\n" +
    "        <strong>{{resourceName}}</strong> has running pods.  Deleting the\n" +
    "        {{typeDisplayName || (kind | humanizeKind)}} will <strong>not</strong> delete the pods\n" +
    "        it controls. Consider scaling the {{typeDisplayName || (kind | humanizeKind)}} down to\n" +
    "        0 before continuing.\n" +
    "      </div>\n" +
    "\n" +
    "      <p>This<span ng-if=\"isProject\"> will <strong>delete all resources</strong> associated with\n" +
    "      the project {{displayName ? displayName : resourceName}} and</span> <strong>cannot be\n" +
    "      undone</strong>.  Make sure this is something you really want to do!</p>\n" +
    "\n" +
    "      <div ng-show=\"typeNameToConfirm\">\n" +
    "        <p>Type the name of the {{typeDisplayName || (kind | humanizeKind)}} to confirm.</p>\n" +
    "        <p>\n" +
    "          <label class=\"sr-only\" for=\"resource-to-delete\">{{typeDisplayName || (kind | humanizeKind)}} to delete</label>\n" +
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
    "\n" +
    "      <div ng-switch=\"kind\">\n" +
    "        <div ng-switch-when=\"Deployment\">\n" +
    "          <strong>Note:</strong> None of the replica sets created by this deployment will be deleted.\n" +
    "\n" +
    "          To delete the deployment and all of its replica sets, you can run the command\n" +
    "          <pre class=\"code prettyprint mar-top-md\">oc delete deployment {{resourceName}} -n {{projectName}}</pre>\n" +
    "          Learn more about the <a href=\"command-line\">command line tools</a>.\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-switch-when=\"DeploymentConfig\">\n" +
    "          <strong>Note:</strong> None of the deployments created by this deployment config will be deleted.\n" +
    "\n" +
    "          To delete the deployment config and all of its deployments, you can run the command\n" +
    "          <pre class=\"code prettyprint mar-top-md\">oc delete dc {{resourceName}} -n {{projectName}}</pre>\n" +
    "          Learn more about the <a href=\"command-line\">command line tools</a>.\n" +
    "        </div>\n" +
    "\n" +
    "        <div ng-switch-when=\"BuildConfig\">\n" +
    "          <strong>Note:</strong> None of the builds created by this build config will be deleted.\n" +
    "\n" +
    "          To delete the build config and all of its builds, you can run the command\n" +
    "          <pre class=\"code prettyprint mar-top-md\">oc delete bc {{resourceName}} -n {{projectName}}</pre>\n" +
    "          Learn more about the <a href=\"command-line\">command line tools</a>.\n" +
    "        </div>\n" +
    "      </div>\n" +
    "\n" +
    "      <!--\n" +
    "        If this is a deployment config or replication controller with associated HPAs, prompt to\n" +
    "        delete the HPAs as well.\n" +
    "      -->\n" +
    "      <div ng-if=\"hpaList.length > 0\">\n" +
    "        <p>\n" +
    "          <span ng-if=\"hpaList.length === 1\">\n" +
    "            This resource has an autoscaler associated with it.\n" +
    "            It is recommended you delete the autoscaler with the resource it scales.\n" +
    "          </span>\n" +
    "          <span ng-if=\"hpaList.length > 1\">\n" +
    "            This resource has autoscalers associated with it.\n" +
    "            It is recommended you delete the autoscalers with the resource they scale.\n" +
    "          </span>\n" +
    "        </p>\n" +
    "        <label>\n" +
    "          <input type=\"checkbox\" ng-model=\"options.deleteHPAs\">\n" +
    "          Delete\n" +
    "          <span ng-if=\"hpaList.length === 1\">\n" +
    "            Horizontal Pod Autoscaler '<strong>{{hpaList[0].metadata.name}}</strong>'\n" +
    "          </span>\n" +
    "          <span ng-if=\"hpaList.length > 1\">\n" +
    "            {{hpaList.length}} associated Horizontal Pod Autoscalers\n" +
    "          </span>\n" +
    "        </label>\n" +
    "      </div>\n" +
    "    </div>\n" +
    "    <div class=\"modal-footer\">\n" +
    "      <button ng-disabled=\"typeNameToConfirm && confirmName !== resourceName && confirmName !== displayName\" class=\"btn btn-lg btn-danger\" type=\"submit\" ng-click=\"delete();\">Delete</button>\n" +
    "      <button class=\"btn btn-lg btn-default\" type=\"button\" ng-click=\"cancel();\">Cancel</button>\n" +
    "    </div>\n" +
    "  </form>\n" +
    "</div>\n"
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

}]);
