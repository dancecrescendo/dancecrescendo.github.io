'use strict';

angular
  .module('myApp', [
    'ngRoute',
    'myApp.home',
    'myApp.init',
    'myApp.class',
    'myApp.setting'
    // 'myApp.illegalAuth'
  ])
  .config(['$locationProvider', '$routeProvider',
    function ($locationProvider, $routeProvider) {
      $routeProvider.otherwise({
        redirectTo: '/home'
      });
    }
  ])
  .run(["$rootScope", "$location", function ($rootScope, $location) {

    // Initialize Firebase
    const config = {
      apiKey: "AIzaSyD_b3R-MIBXJspn0YVhcTqChyESt00ft10",
      authDomain: "crescendoschedulizer.firebaseapp.com",
      databaseURL: "https://crescendoschedulizer.firebaseio.com",
      storageBucket: "crescendoschedulizer.appspot.com",
      messagingSenderId: "167643584544"
    };
    firebase.initializeApp(config);

    // Redirect to home, if illegal access without auth
    $rootScope.$on("$routeChangeError", function (event, next, previous, error) {
      if (error === "AUTH_REQUIRED") {
        $location.path("/home");
      }
    });
  }]);