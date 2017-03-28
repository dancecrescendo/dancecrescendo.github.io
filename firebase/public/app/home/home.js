'use strict';

angular.module('myApp.home', ['ngRoute'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/home', {
      templateUrl: 'app/home/home.html'
      // controller: 'HomeCtrl'
    });
  }])
  .controller('HomeCtrl', ["$scope", "$location",
    function ($scope, $location) {
    }
  ]);