OpenShift Common Web Services
==============================
The common services used for the [OpenShift Management Console](https://github.com/openshift/origin-web-console).

[![Build Status](https://travis-ci.org/openshift/origin-web-common.svg?branch=master)](https://travis-ci.org/openshift/origin-web-common)

Contributing
------------

#### Getting started
1. Install [Nodejs](http://nodejs.org/) and [npm](https://www.npmjs.org/)
2. Install [grunt-cli](http://gruntjs.com/installing-grunt) and [bower](http://bower.io/) by running `npm install -g grunt-cli bower` (may need to be run with sudo)
3. Install dependencies by running  `npm install` and  `bower install`
4. Build and run tests by running `grunt build`

#### Before opening a pull request

Please configure your editor to use the
following settings to avoid common code inconsistencies and dirty
diffs:

* Use soft-tabs set to two spaces.
* Trim trailing white space on save.
* Set encoding to UTF-8.
* Add new line at end of files.

Or [configure your editor](http://editorconfig.org/#download) to
utilize [`.editorconfig`](https://github.com/openshift/origin-web-common/blob/master/.editorconfig),
which will apply these settings automatically.

Then:

1. If needed, run `grunt build` to update the files under the dist directory
2. Run the spec tests with `grunt test`
4. Rebase and squash changes to a single commit
