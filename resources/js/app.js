'use strict';

// Declare app level module which depends on filters, and services
var myApp = angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers',
  'ngSanitize', //http://stackoverflow.com/questions/9381926/insert-html-into-view-using-angularjs
  'cfp.loadingBar' //https://github.com/chieffancypants/angular-loading-bar
]);

