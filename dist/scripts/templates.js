angular.module('openshiftCommonUI').run(['$templateCache', function($templateCache) {
  'use strict';

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
    "        {{submitButtonLabel}}\n" +
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
