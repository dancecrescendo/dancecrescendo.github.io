'use strict';

angular.module('myApp.setting', ['ngRoute', 'firebase'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/setting', {
      templateUrl: 'app/setting/setting.html',

      // Auth: Check the auth status
      // Redirect to home, if auth is not appropriate
      resolve: {
        "currentAuth": ["Auth", function (Auth) {
          return Auth.$requireSignIn();
        }]
      }
    });
  }])

  .controller('SettingCtrl', ["$scope", "Auth", "$firebaseArray", "Helper",
    function ($scope, Auth, $firebaseArray, Helper) {
      // Flag: Display loading status until data retrieved from server
      $scope.loadSuccess = false;

      const ref = firebase.database().ref('setting');
      const fb_array = $firebaseArray(ref);
      $scope.objects = {};

      // Retrieve data from server
      $scope.load = function () {
        fb_array.$loaded().then(function () {
          fb_array.forEach(function (element) {
            $scope.storeData(element);
          });
          $scope.loadSuccess = true;
        })
      }

      // Store data into local variable retrieved from db
      $scope.storeData = function (obj) {
        if (obj.$id === "label") {
          $scope.objects[obj.$id] = {
            level: Helper.splitValue(obj.level),
            type: Helper.splitValue(obj.type)
          }
        } else {
          $scope.objects[obj.$id] = {
            data: obj,
            // string: obj.$value,
            array: Helper.splitValue(obj.$value)
          }
        }
      }

      // Init function when modal activate
      $scope.modalInit = function (target) {
        $scope.cloneArray = target.array.slice(0);
        $scope.targetId = target.data.$id;

        // Create colors variable for label color
        if ($scope.targetId === "type" || $scope.targetId === "level") {
          $scope.colors = $scope.objects["label"][$scope.targetId];
        }
      }

      // Delete setting element
      $scope.deleteElement = function (idx, array) {
        if (confirm(`Do you really want to delete: \n${array[idx]}`)) {

          if (array.length > 1) {
            // Each setting needs at least one element
            array.splice(idx, 1);
            
            // It also needs to remove label color, when type or level setting removed
            if ($scope.targetId === "type" || $scope.targetId === "level") {
              $scope.colors.splice(idx, 1);
            }
          }else{
            // Prevent when user tries to delete all element in the setting
            alert("Denied: You need to have at least one element in this setting");
          }
        }
      }

      // Add new empty input
      $scope.addElement = function (idx, array) {
        array.push("");

        // Add also color label attribute when target setting is type and level
        if ($scope.targetId === "type" || $scope.targetId === "level") {
          $scope.colors.push("#ffffff"); //Default: white
        }
      }

      // Track the change of text input by ng-change
      $scope.trackChanges = function (idx, array) {
        array[idx] = array[idx];
      }

      // Submit the changes
      $scope.submitSetting = function () {
        const resultStr = Helper.mergeArray($scope.cloneArray);
        const dbIdx = fb_array.$indexFor($scope.targetId);

        // Save label color when both set type or level of class
        if ($scope.targetId === "type" || $scope.targetId === "level") {
          const dbIdx_color = fb_array.$indexFor("label");

          fb_array[dbIdx_color][$scope.targetId] = Helper.mergeArray($scope.colors);

          fb_array.$save(dbIdx_color); // Save: changes of new color
        }

        // Save: new string value 
        fb_array[dbIdx].$value = resultStr;

        // Save to DB
        fb_array.$save(dbIdx).then(function (ref) {
          window.setTimeout(function () {
            $scope.load(); //Reload data
            document.getElementById('close-modal').click(); // Close modal
          }, 500);
        })
      }
    }
  ]);