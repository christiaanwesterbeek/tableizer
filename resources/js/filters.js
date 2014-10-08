'use strict';

/* Filters */

angular.module('myApp.filters', [])
  .filter('euro', function($filter){    
    var baseFilterFn = $filter('currency');
    return function(){
      var baseResult             = baseFilterFn.apply(this, arguments);
      var extendedFilteredResult = baseResult.replace(/\./, ',');
      return extendedFilteredResult;
    };
  });
