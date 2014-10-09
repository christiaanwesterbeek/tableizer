'use strict';


/* Controllers */
angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', function($scope) {
    $scope.transposed = false;
    $scope.dedupmulti = true;

    function tab2html(s) {
      if (!s) return;

      //deduplicate multiple consecutive line breaks
      if ($scope.dedupmulti) 
        s = s.replace(/(\n\r?)+/g, '\n');

      //split on line breaks
      var a = s.split(/\n\r?/);
      console.log(a);
      
      if (a.length === 0) return;
      
      //split each line on tabs
      a = _.map(a, function(item) { return item.split(/\t/); });

      //potentially transpose
      if ($scope.transposed) 
        a = _.zip.apply(_, a); //http://stackoverflow.com/a/17428779/1385429

      //convert to html
      console.log(a);
      var sep = 'th', line;
      a = _.map(a, function(item) {
        line = '<'+sep+'>' + item.join('</'+sep+'><'+sep+'>') + '</'+sep+'>';
        sep = 'td';
        return line;
      });

      s = [
        '<table border=1>',
        '  <thead>',
        '    <tr>' + a.shift() + '</tr>', //shift returns removed item
        '  </thead>', 
        '  <tbody>',
        '     <tr>' + a.join('</tr><tr>') + '</tr>',
        '  </tbody>',
        '</table>'
      ].join('\n');

      console.log(s);

      //layout ideas:
      //- http://jsfiddle.net/mjaric/pJ5BR/
      //- http://stackoverflow.com/questions/21375073/best-way-to-represent-a-grid-or-table-in-angularjs-with-bootstrap-3
      //- http://stackoverflow.com/questions/13813254/how-do-i-conditionally-apply-css-styles-in-angularjs

      //draggable columns:
      //- http://www.danvk.org/wp/dragtable/
      //- http://bytes.com/topic/javascript/insights/750692-drag-drop-table-columns-new-version-explained

      return s;
    }

    //options: trim all values, transpose, remove trailing lines

    $scope.transform = function() {
      var html = tab2html($scope.source);

      $scope.target = {
        value: html
      };
    };

  }]);