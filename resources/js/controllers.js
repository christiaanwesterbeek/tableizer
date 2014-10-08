'use strict';


/* Controllers */
angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', function($scope) {
    $scope.transposed = false;

    function tab2html(s) {
      if (!s) return;
      
      var a = s.split(/\n\r?/);
      
      if (a.length === 0) return;
      
      a = _.map(a, function(item) { return item.split(/\t/); });
      return a;
    }

    //options: trim all values, transpose, remove trailing lines

    $scope.transform = function() {
      var html = tab2html($scope.source);
      console.log(html);

      $scope.target = {
        value: html
      };
    };

  }]);
