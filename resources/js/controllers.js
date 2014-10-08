'use strict';


/* Controllers */
angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', function($scope) {
    console.log('$scope.source', $scope.source);

    $scope.transform = function() {
      $scope.target = {
        value: $scope.source
      };
    };

  }]);
