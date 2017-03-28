'use strict';

angular.module('myApp.illegalAuth', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/illegalAuth', {
      templateUrl: 'app/error/illegalAuth.html',
    });
  }])
  .controller('illegalAuthCtrl', ["$location", "$timeout",
    function ($location, $timeout) {
      $timeout(function () {
        $location.path('/home');
      }, 500);
    }
  ]);