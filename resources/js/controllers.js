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
  var a = scope.tab2array(scope.source);

  //swap the indexes of each row
  a = _.map(a, function(item) { return item.swapItems(oldIndex, newIndex); });

  //
  scope.source = scope.array2tab(a);
  scope.transform();
  scope.$apply();
}

/* Controllers */
angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', function($scope) {
    var emptyText= '<i>Formatted table will appear here. Paste your tabular data in the area above.</i>';
    $scope.transposed = false;
    $scope.dedupmulti = true;
    $scope.source     = 'a\ts\td\tf\tg\th\tj\tk\tl\n' +
                        '1\t2\t3\t4\t5\t6\t7\t8\t9';
    $scope.target     = emptyText;

    $scope.tab2array = function(s) {
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

      return a;
    };

    $scope.array2tab = function(a) {
      if (!a) return;

      //split each line on tabs
      var b = _.map(a, function(item) { return item.join('\t'); });

      return b.join('\n');
    }    

    function tab2html(s) {
      var a = $scope.tab2array(s);

      if (!a) return;

      var sep = 'th', line;
      a = _.map(a, function(item) {
        line = '<'+sep+'>' + item.join('</'+sep+'><'+sep+'>') + '</'+sep+'>';
        sep = 'td';
        return line;
      });

      s = [
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
      var html = tab2html($scope.source);

      $scope.target = html || emptyText;
    };

  }]).filter('unsafe', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
}]);