'use strict';

angular.module('myApp.init', ['ngRoute', 'firebase'])
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider.when('/init', {
      templateUrl: 'app/init/init.html',

      // Auth: Wait until user sign in with Google Account
      resolve: {
        "currentAuth": ["Auth", function (Auth) {
          return Auth.$waitForSignIn();
        }]
      }
    });
    // $locationProvider.hashPrefix('');
    $locationProvider.html5Mode(true);
  }])

  .controller('InitCtrl', ["$scope", "$location", "$firebaseAuth", "$firebaseArray", "$q",
    function ($scope, $location, $firebaseAuth, $firebaseArray, $q) {

      // Get authorized user from db asynchronously
      this.getAuthUserFromDB = function () {
        // Asynch
        const defer = $q.defer();

        const ref_setting = firebase.database().ref('setting');
        const settingObj = $firebaseArray(ref_setting);

        settingObj.$loaded().then(function () {
          const authedGmail = settingObj.$getRecord('auth').$value.split(",");
          defer.resolve(authedGmail)
        }, function () {
          defer.reject();
        });
        return defer.promise;
      }

      // Check whether user registered as authorized user by Google account
      $scope.checkAuthList = function (userEmail, array) {
        let result = false;;
        array.forEach(function(authEmail) {
          if(userEmail === authEmail){
            result = true;
          }
        });
        return result;
      }

      // Auth Controller: allow/prevent access to the system depend the user authorized
      this.getAuthUserFromDB().then(function (authArr) {
        const auth = $firebaseAuth();
        const authProvider = new firebase.auth.GoogleAuthProvider();
        let logged = false;

        // Watch the changes of user auth state
        auth.$onAuthStateChanged(function (firebaseUser) {
          if (firebaseUser) { // If user accessed with Google account
            // If the loggedin user is not authroized,
            if ( $scope.checkAuthList(firebaseUser.email, authArr) === false) {
              alert("Sorry, You are not authorized user");
              auth.$deleteUser();
              auth.$signOut();
              logged = true;
            } else {
              // Access to the system, if user was authorized
              $location.path('/class');
            }
          } else { // If user accessed without Google account

            // This part would not work actually,
            // since ngRoute will redirect to home anyways
            // without auth or illegal access
            if (logged === false) {
              auth.$signInWithRedirect(authProvider);
            } else if (logged === true) {
              $location.path('/home');
              logged = false;
            }
          }
        });
      })
    }
  ])
  .factory("Auth", ["$firebaseAuth",
    function ($firebaseAuth) {
      return $firebaseAuth();
    }
  ]);