'use strict';

Array.prototype.swapItems = function(a, b){
    this[a] = this.splice(b, 1, this[a])[0];
    return this;
};

/**
 * Usage: _scope('[ng-controller=MainCtrl]');
 */
window._scope = function(selector){
  return angular.element(selector).scope();
};

window._swapColumns = function(oldIndex, newIndex) {
  //get the angular scope
  var scope = _scope('[ng-controller=MainCtrl]');

  //convert the thing in the textarea to an array
  if (!scope.array) {
    scope.array = scope.tab2array();
  }

  //swap the indexes of each row
  scope.array = _.map(scope.array, function(item) { return item.swapItems(oldIndex, newIndex); });
  //and then continue to do as with transpose :)
  scope.source = scope.array2tab();
  scope.target = scope.formatter();
  scope.$apply();
}

/* Controllers */
angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', function($scope) {
    var emptyText= '<i>Formatted table will appear here. Paste your tabular data in the area above.</i>';
    $scope.dedupmulti = true;
    $scope.source     = 'a\ts\td\tf\tg\th\tj\tk\tl\n' +
                        '1\t2\t3\t4\t5\t6\t7\t8\t9';
    $scope.array      = undefined;
    $scope.target     = emptyText;


    $scope.tab2array = function() {
      var s = $scope.source;
      if (!s) return;

      //deduplicate multiple consecutive line breaks
      if ($scope.dedupmulti) 
        s = s.replace(/(\n\r?)+/g, '\n');

      //split on line breaks
      var a = s.split(/\n\r?/);
      
      if (a.length === 0) return;
      
      //split each line on tabs
      a = _.map(a, function(item) { return item.split(/\t/); });

      return a;
    };

    $scope.array2tab = function() {
      var a = $scope.array;
      if (!a) return;

      //split each line on tabs
      var b = _.map(a, function(item) { return item.join('\t'); });

      return b.join('\n');
    }


    $scope.formatter = function() {
      var a = $scope.array;
      if (!a) return;

      var sep = 'th', line;
      a = _.map(a, function(item) {
        line = '<'+sep+'>' + item.join('</'+sep+'><'+sep+'>') + '</'+sep+'>';
        sep = 'td';
        return line;
      });

      var s = [
        '<table class="tableizer" id="tableOne">',
        '  <thead>',
        '    <tr>' + a.shift() + '</tr>', //shift returns removed item
        '  </thead>', 
        '  <tbody>',
        '     <tr>' + a.join('</tr><tr>') + '</tr>',
        '  </tbody>',
        '</table>',
        '<script type="text/javascript-lazy">',
        '  var t1=new dragTable(\'tableOne\', _swapColumns)',
        '</script>'
      ].join('\n');

      //layout ideas:
      //- http://jsfiddle.net/mjaric/pJ5BR/
      //- http://stackoverflow.com/questions/21375073/best-way-to-represent-a-grid-or-table-in-angularjs-with-bootstrap-3
      //- http://stackoverflow.com/questions/13813254/how-do-i-conditionally-apply-css-styles-in-angularjs

      //draggable columns thanks to:
      //- http://www.danvk.org/wp/dragtable/
      //- http://bytes.com/topic/javascript/insights/750692-drag-drop-table-columns-new-version-explained

      return s;
    }

    //options: trim all values, transpose, remove trailing lines

    $scope.transform = function() {
      $scope.array  = $scope.tab2array();
      $scope.target = $scope.formatter() || emptyText;
    };
    $scope.transpose = function() {
      if (!$scope.array) {
        $scope.array = $scope.tab2array();
      }
      $scope.array = _.zip.apply(_, $scope.array); //http://stackoverflow.com/a/17428779/1385429
      $scope.source = $scope.array2tab();
      $scope.target = $scope.formatter() || emptyText;
    };

  }]).filter('unsafe', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
}]);