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

window._swapColumns = function(oldIndex, newIndex, droppedElm) {
  //get the angular scope
  var scope = _scope('[ng-controller=MainCtrl]');

  //convert the thing in the textarea to an array if it's not there yet
  if (!scope.array) {
    scope.array = scope.tab2array();
  }

  if (newIndex === false && droppedElm.className == 'delete-column') {
    scope.array = _.map(scope.array, function(item) { item.splice(oldIndex, 1); return item; });
  } else if (newIndex !== false) {
    //swap the indexes of each row
    scope.array = _.map(scope.array, function(item) { return item.swapItems(oldIndex, newIndex); });
  } else {
    scope.$apply();
    return;
  }
  //and then continue to do as with transpose :)
  scope.source = scope.array2tab();
  scope.target = scope.formatter();
  scope.$apply();
};

/* Controllers */
angular.module('myApp.controllers', [])
  .controller('MainCtrl', ['$scope', function($scope) {
    var dragColumnsTip = 'Psst, try to drag the columns...<span class="delete-column" style="border: 2px dashed #ccc;">or drop here to delete it.</span>';

    $scope.message    = 'Formatted table will appear here. Paste your tabular data in the area above.';
    $scope.dedupmulti = true;
    $scope.source     = ''; //'a\ts\td\tf\tg\th\tj\tk\tl\n' + '1\t2\t3\t4\t5\t6\t7\t8\t9';
    $scope.array      = undefined;
    $scope.target     = undefined;
    $scope.format     = 'html';
    $scope.working    = false;

    $scope.tab2array = function() {
      var s = $scope.source;
      if (!s) return;

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
    };


    $scope.formatter = function() {
      var a = $scope.array, s;
      if (!a) return;

      /**
       * a:  input // (int or string) or undefined,NaN,false,empty string default:0
       * PadLength // (int) default:2
       * PadCharacter // (string or int) default:'0'
       * PadDirection // (boolean) default:0 (padLeft) - (true or 1) is padRight 
       */
      function pad(a,b,c,d){ //http://stackoverflow.com/a/21348957/1385429
        return a=(a||c||0)+'',b=new Array((++b||3)-a.length).join(c||0),d?a+b:b+a
      }

      if ($scope.format === 'text') {
        //calculate max length per columm
        //[["a","s","d","f","g","h","j","k","l"],["1","2","3","4","5","6","7","8","98"]]
        //console.log(1, a);
        //create an array per columns by using transposition
        var columns = _.zip.apply(_, $scope.array); //http://stackoverflow.com/a/17428779/1385429
        //columns: [["a","1"],["s","2"],["d","3"],["f","4"],["g","5"],["h","6"],["j","7"],["k","8"],["l","98"]]
        //console.log(2, columns);

        //Calculate the max length per column
        var lengths = _.map(columns, function(item) {
          return Math.max.apply(Math, _.map(item, function (el) { return el.length }));
        });
        //lengths: [1, 1, 1, 1, 1, 1, 1, 1, 2]
        //console.log(3, lengths);

        //pad the values of each column to the length of the longest value in the column
        for (var l = lengths.length - 1, i = l; i>=0; i-- ) { //lengths and columns have the same length
          columns[i] = _.map(columns[i], function(item) { return pad(item, lengths[i], ' ', true); });
        }
        //console.log(4, columns);
        //transpose back the to the original array (with padded values)
        a = _.zip.apply(_, columns);

        //join each line with a space
        a = _.map(a, function(item) { return item.join(' '); });

        return [
          '<pre>',
          a.join('\n'),
          '</pre>'
        ].join('\n');
      }

      var sep = 'th', line;
      a = _.map(a, function(item) {
        line = '<'+sep+'>' + item.join('</'+sep+'><'+sep+'>') + '</'+sep+'>';
        sep = 'td';
        return line;
      });

      return [
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
    };

    //options: trim all values, transpose, remove trailing lines

    $scope.$watch('format', function(value) {
      $scope.transform();
    });

    $scope.transform = function() {
      $scope.working = true;
      $scope.array  = $scope.tab2array();
      $scope.target = $scope.formatter();
      $scope.message = ($scope.format === 'text') ? '' : dragColumnsTip;
      $scope.working = false;
    };
    $scope.transpose = function() {
      $scope.working = true;
      if (!$scope.array) {
        $scope.array = $scope.tab2array();
      }
      $scope.array = _.zip.apply(_, $scope.array); //http://stackoverflow.com/a/17428779/1385429
      $scope.source = $scope.array2tab();
      $scope.target = $scope.formatter();
      $scope.message = ($scope.format === 'text') ? '' : dragColumnsTip;
      $scope.working = false;
    };
    $scope.removeEmptyLines = function() {
      $scope.working = true;
      $scope.source = $scope.source && $scope.source.replace(/(\n\r?)+/g, '\n');
      $scope.array = $scope.tab2array();

      $scope.target = $scope.formatter();
      $scope.message = ($scope.format === 'text') ? '' : dragColumnsTip;
      $scope.working = false;
    };
    $scope.findReplace = function() {
      $scope.working = true;
      if (!$scope.findValue)
        return;
      $scope.source = $scope.source && $scope.source.split($scope.findValue).join($scope.replaceValue);
      $scope.array = $scope.tab2array();

      $scope.target = $scope.formatter();
      $scope.message = ($scope.format === 'text') ? '' : dragColumnsTip;
      $scope.working = false;
    };
    $scope.selectAll = function () {
      //http://stackoverflow.com/a/20079910/1385429
      var node = document.getElementById( 'target' );

      if ( document.selection ) {
        var range = document.body.createTextRange();
        range.moveToElementText( node  );
        range.select();
      } else if ( window.getSelection ) {
        var range = document.createRange();
        range.selectNodeContents( node );
        window.getSelection().removeAllRanges();
        window.getSelection().addRange( range );
      }      
    };

  }])
  .filter('unsafe', ['$sce', function ($sce) {
    return function (val) {
        return $sce.trustAsHtml(val);
    };
  }])
  .directive('jsonText', function() {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attr, ngModel) {            
        function into(input) {
          //console.log(JSON.parse(input));
          return JSON.parse(input);
        }
        function out(data) {
          return JSON.stringify(data);
        }
        ngModel.$parsers.push(into);
        ngModel.$formatters.push(out);
      }
    };
});