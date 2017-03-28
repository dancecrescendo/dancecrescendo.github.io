'use strict';

angular.module('myApp.class', ['ngRoute', 'firebase'])

  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/class', {
      templateUrl: 'app/class/class.html',
      resolve: {
        "currentAuth": ["Auth", function (Auth) {
          return Auth.$requireSignIn();
        }]
      }
    });
  }])

  .controller('NavCtrl', ["$scope", "$location", "Auth",
    function ($scope, $location, Auth) {

      // Sign out function from the application
      $scope.signOutFunc = function (msg) {
        if (confirm(msg)) {
          Auth.$signOut().then(function () {
            $location.path("/home");
          }, function (error) {
            console.log(error);
          })
        }
      }

      // Sign out from app only, but maintain the login status on Google
      $scope.signOutFromApp = function () {
        const msg = `\nDo you want to sign out from the manager?\nIt will not be logged out your Google account.\n`;
        $scope.signOutFunc(msg);
      }

      // Sign out from both app and Google
      $scope.logOutFromGoogle = function () {
        const msg = `\nDo you want to log out your Google account?\nIt will sign out from the manager as well.\n`;
        $scope.signOutFunc(msg);

        // Redirect to Google logout url
        window.location.href = "https://accounts.google.com/Logout";
      }
    }
  ])
  //     // const classRef = ref.orderByChild('day').equalTo('mon');

  .controller('ClassCtrl', ["$scope", "$firebaseArray", "$timeout", "$q", "Helper",
    function ($scope, $firebaseArray, $timeout, $q, Helper) {
      // Class DB
      const ref_class = firebase.database().ref('class');
      $scope.classObj = $firebaseArray(ref_class);

      // Setting DB
      const ref_setting = firebase.database().ref('setting');
      $scope.settingObj = $firebaseArray(ref_setting);

      // The arrays contain general variables
      $scope.hours = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
      $scope.mins = ["00", "15", "30", "45"];
      $scope.ampm = ["AM", "PM"];

      // Default filter
      let currentFilter = 'day';

      // Initialize the page with loading data from DB
      $scope.load = function () {
        $scope.classObj.$loaded().then(function () {

          // Flag: Display loading status until data retrieved from server
          $scope.loadSuccess = false;

          // Order by latest of Classes
          $scope.latest = $scope.classObj.slice().reverse();

          // Init object for storing sorted class
          $scope.sortedClassObject = {};

          // Load settings and classes from the DB
          $scope.loadSetting();
        })
      }

      // Load setting variables from the server
      $scope.loadSetting = function () {
        $scope.settingObj.$loaded().then(function () {

          // Objects contain settings retrived from the server
          $scope.set = {
            type: Helper.splitValue($scope.settingObj.$getRecord('type').$value),
            level: Helper.splitValue($scope.settingObj.$getRecord('level').$value),
            day: Helper.splitValue($scope.settingObj.$getRecord('day').$value),
            duration: Helper.splitValue($scope.settingObj.$getRecord('duration').$value),
            studio: Helper.splitValue($scope.settingObj.$getRecord('studio').$value),
            label: Helper.splitValue($scope.settingObj.$getRecord('label').type)
          }

          // Sort classes by specific setting variable
          $scope.setFilter('day');
          $scope.setFilter('type');
          $scope.setFilter('level');
          $scope.setFilter('studio');

          // Flag: Hide loading status after data has been retrieved from server
          $scope.loadSuccess = true;

          // 
          $scope.filterHandler(currentFilter);
        })
      }

      // Sort classes order by user input sorts
      $scope.setFilter = function (sort) {
        // Initialize the empty sub object
        $scope.sortedClassObject[sort] = {};

        // Sorting classes based on the input sort based on the loaded setting attributes
        // If input sort variable is not defined, error will be catched
        try {
          if ($scope.set[sort] === undefined) {
            throw `Error: No "${sort}" variable in setting`;
          }
        } catch (err) {
          console.log(err);
        } finally {
          $scope.set[sort].forEach(function (select) {
            const temp = [];
            $scope.classObj.forEach(function (object) {
              if (object[sort] === select) {
                temp.push(object);
              }
            })
            if (temp.length > 0) {
              // Sort the array by priority
              Helper.sortByDay(temp);
            }

            // Set the sorted array into object
            $scope.sortedClassObject[sort][select] = temp;
          });
        }
      }

      // Handling type of display classes based on user selected filter to order
      $scope.filterHandler = function (select) {
        // Store selected current filter for refreshing after add or update
        currentFilter = select;

        if (select === 'latest') {
          // If latest order has been selected by user
          $scope.filter = false;

        } else {
          // If order filter has been selected by user
          $scope.filter = true;

          // Set selected filter by user as displaying class order
          $scope.displayingSortedClass = $scope.sortedClassObject[select];

          // Show "Studio" in front of studio number when studio has been selected
          if (select === 'studio') {
            $scope.studioFilter = true;
          } else {
            $scope.studioFilter = false;
          }
        }
      }

      // Reset forms in input class info
      $scope.resetForm = function () {
        // Make null all value in form 
        $scope.info.label = '#ffffff';
        $scope.info.name = null;
        $scope.info.type = null;
        $scope.info.level = null;
        $scope.info.day = null;
        $scope.info.duration = null;
        $scope.info.studio = null;
        $scope.info.hour = null;
        $scope.info.min = null;
        $scope.info.ampm = null;
      }

      // Set values retrieved data from db to modify it
      $scope.initModify = function (id) {

        // Retreive saved data into form
        $scope.info.id = id.$id;
        $scope.info.name = id.name;
        $scope.info.type = id.type;
        $scope.info.level = id.level;
        $scope.info.day = id.day;
        $scope.info.duration = id.duration;
        $scope.info.studio = id.studio;
        $scope.info.hour = id.hour;
        $scope.info.min = id.min;
        $scope.info.ampm = id.ampm;
        $scope.info.label = id.label;

        $scope.update = true; // Flag: update existing class
      }

      // Initialize the form to add new class
      $scope.initNewClass = function () {
        $scope.resetForm(); // Reset value in form
        $scope.update = false; // Flag: create new class

      }

      // Restrict in class name input field
      $scope.nameCtrl = function (event) {
        // Limits the size of class name by user input
        const limit_col = 12;
        const limit_row = 2;

        //Values in textArea
        const text = event.target.value;

        // Split the value of textArea to object array and store the length of it as num of line
        const line = text.split(/\r\n|\r|\n/);
        const num_line = line.length;

        /*
        8: Backspace
        9: Tap
        13: Enter
        33: Page up
        34: Page down
        35: End
        36: Home
        37: ←
        38: ↑
        39: →
        40: ↓
        46: Delete
        116: f5
        */

        const allowedKeys = [8, 9, 13, 33, 34, 35, 36, 37, 38, 39, 40, 46, 116];

        // Detect whether text length exceeded the limits
        let col_limit = [];
        let n = 0;
        // line.forEach(arr => arr.length > limit_col ? (col_limit[n] = false, n++) : (col_limit[n] = true, n++));

        // When press enter within maximum row
        if (event.key === "Enter" && num_line >= limit_row) {
          event.preventDefault();
        }

        const cursor = document.getElementById('input-name').selectionEnd;

        if (num_line === 1) { // If input name is single line 
          if (line[0].length >= limit_col && allowedKeys.indexOf(event.keyCode) === -1) {
            event.preventDefault();
          }
        } else if (num_line === 2) { // If input name is two lines
          if (line[0].length >= limit_col) {
            if (cursor <= limit_col && allowedKeys.indexOf(event.keyCode) === -1) {
              event.preventDefault();
            } else if (cursor >= (limit_col * 2) && allowedKeys.indexOf(event.keyCode) === -1) {
              event.preventDefault();
            }
          } else if (line[1].length >= limit_col) {
            if (cursor > (limit_col + line[0].length) && allowedKeys.indexOf(event.keyCode) === -1) {
              event.preventDefault();
            } else if (line[0].length >= limit_col && allowedKeys.indexOf(event.keyCode) === -1) {
              event.preventDefault();
            }
          }
        }
      }

      // Set type label color when user changes
      $scope.setTypeColor = function (type) {
        $scope.info.label = $scope.set.label[$scope.set.type.indexOf(type)];
      }

      $scope.checkConflictsClass = function (className) {
        // Asynch
        const defer = $q.defer();

        $scope.classObj.$loaded().then(function () {
          const newC_End = Helper.calcEndTime(className.hour, className.min, className.ampm, className.duration);
          const newC = {
            begin: {
              hour: Helper.twlvToTwtFr(className.hour, className.ampm),
              min: parseInt(className.min)
            },
            end: {
              hour: Helper.twlvToTwtFr(newC_End[0], newC_End[2]),
              min: newC_End[1]
            }
          }

          let result;

          $scope.classObj.forEach(function (object) {

            // TODO: include className.studio === object.studio
            if ((className.id !== object.$id) // Not same class
              &&
              (className.day === object.day) // Same day
              &&
              (className.studio === object.studio) // Same studio
            ) {
              const comp_End = Helper.calcEndTime(object.hour, object.min, object.ampm, object.duration);
              const comp = {
                begin: {
                  hour: Helper.twlvToTwtFr(object.hour, object.ampm),
                  min: parseInt(object.min)
                },
                end: {
                  hour: Helper.twlvToTwtFr(comp_End[0], comp_End[2]),
                  min: comp_End[1]
                }
              }

              if (comp.end.hour <= newC.begin.hour) { // Comp Time < New Time
                if ((comp.end.hour === newC.begin.hour) && (comp.end.min > newC.begin.min)) {
                  result = true;

                } else {
                  result = false;
                }
              } else if (newC.end.hour <= comp.begin.hour) { // New Time < Comp Time
                if ((newC.end.hour === comp.begin.hour) && (newC.end.min > comp.begin.min)) {
                  result = true;

                } else {
                  result = false;
                }
              } else { // Duplicate class time detected
                result = false;
              }
            }
            if (result === true) {
              const temp = {
                flag: true,
                name: object.name
              }
              defer.resolve(temp);
            }
          })
          const temp = {
            flag: false,
            name: null
          }
          defer.resolve(temp);

        }, function () {
          defer.reject();
        });

        // return async promise
        return defer.promise;
      }

      // Save or Update data to server by submitted from a user
      $scope.submitClass = function () {
        $scope.checkConflictsClass($scope.info).then(function (result) {
          if (result.flag === true && result.name !== null) {
            alert(`Error: Time conflicts with another class! \n${result.name}`);
          } else if (result.flag === false) {
            if ($scope.update === true) { // Update a existed class
              const targetIdx = $scope.classObj.$indexFor($scope.info.id);
              // Save the updated data to variables in firebasearray objects
              $scope.classObj[targetIdx].name = $scope.info.name;
              $scope.classObj[targetIdx].type = $scope.info.type;
              $scope.classObj[targetIdx].level = $scope.info.level;
              $scope.classObj[targetIdx].day = $scope.info.day;
              $scope.classObj[targetIdx].dayIdx = $scope.set.day.indexOf($scope.info.day);
              $scope.classObj[targetIdx].duration = $scope.info.duration;
              $scope.classObj[targetIdx].studio = $scope.info.studio;
              $scope.classObj[targetIdx].hour = $scope.info.hour;
              $scope.classObj[targetIdx].min = $scope.info.min;
              $scope.classObj[targetIdx].ampm = $scope.info.ampm;
              $scope.classObj[targetIdx].label = $scope.info.label;

              // Save existed data in the server
              $scope.classObj.$save(targetIdx).then(function (ref) {
                // $scope.success = true;
                $timeout(function () {
                  window.setTimeout(function () {
                    // $scope.success = false;
                    $scope.load();

                    document.getElementById('close-modal').click();
                  }, 500);
                });

              }, function (error) {
                console.log(error);
              });
            } else if ($scope.update === false) { // Add a new class
              // Save new data to the server
              $scope.classObj.$add({
                day: $scope.info.day,
                dayIdx: $scope.set.day.indexOf($scope.info.day),
                name: $scope.info.name,
                type: $scope.info.type,
                level: $scope.info.level,
                duration: $scope.info.duration,
                studio: $scope.info.studio,
                hour: $scope.info.hour,
                min: $scope.info.min,
                ampm: $scope.info.ampm,
                label: $scope.info.label
              }).then(function (ref) {
                // $scope.success = true;
                $timeout(function () {
                  window.setTimeout(function () {
                    $scope.load();
                    document.getElementById('close-modal').click();
                  }, 500);
                })
              }, function (error) {
                console.log(error);
              });
            }
          }
        });
      }

      // Remove selected class from DB
      $scope.removeClass = function (id) {
        const target = $scope.classObj.$getRecord(id);
        const msg =
          `Do you really want to delete this class:\n  ${target.name}\n  ${target.type} ${target.level} class\n  ${target.day} ${target.hour}:${target.min}`;

        if (confirm(msg)) {
          $scope.classObj.$remove(target);
          $scope.load();
        }
      }

      // Display time of class
      $scope.getTime = function (hour, min, ampm, duration) {
        // Get class ends as array [hour, min, ampm])
        const endTimeArr = Helper.calcEndTime(hour, min, ampm, duration);

        return `${Helper.timeFormat(hour, min, ampm)} - ${Helper.timeFormat(endTimeArr[0], endTimeArr[1], endTimeArr[2])}`;
      }
    }
  ])

  .factory('Helper', function () {
    return {
      // Return time format
      timeFormat: function (hour, min, ampm) {
        // 
        if (min === 0 || min === 60) {
          min = "00";
        } else {
          min = min.toString();
        }
        hour = hour.toString();
        return `${hour}:${min} ${ampm}`;
      },

      // Get array of class ends from input begin time
      calcEndTime: function (hour, min, ampm, duration) {
        let hour_t = parseInt(hour),
          min_t = parseInt(min),
          duration_t = parseInt(duration);

        // Add duration to minutes
        min_t += duration_t;

        // Add minutes to hour
        while (min_t >= 60) {
          min_t -= 60;
          hour_t++;

          // Convert time by increased value
          if (hour_t === 12 && ampm === "AM") {
            ampm = "PM"; // 12:00 PM
          } else if (hour_t === 12 && ampm === "PM") {
            ampm = "AM"; // 12:00 AM
            hour_t = 0;
          } else if (hour_t === 13 && ampm === "PM") {
            hour_t = 1; // 1:00 PM
          } else if (hour_t === 13 && ampm === "AM") {
            hour_t = 1; // 1:00 AM
          }
        }
        return [hour_t, min_t, ampm];
        // return `${hour_t}:${min_t} ${ampm}`;
      },

      splitValue: function (string) {
        return string.split(",");
      },

      mergeArray: function (array) {
        let result = "";
        for (let i = 0; i < array.length - 1; i++) {
          result += array[i] + ",";
        }
        result += array[array.length - 1];
        return result;
      },

      twlvToTwtFr: function (hour, ampm) {
        hour = parseInt(hour);
        if (ampm === "PM") {
          return hour + 12;
        } else {
          return hour;
        }
      },

      // Sort By day priority : day, ampm, hour, min
      sortByDay: function (array) {
        array.sort(function (a, b) {
          // Day
          let result = parseInt(a.dayIdx) - parseInt(b.dayIdx);

          if (result === 0) {
            // AM, PM
            result = a.ampm.localeCompare(b.ampm);
            if (result === 0) {
              // Hour
              result = parseInt(a.hour) - parseInt(b.hour);
              if (result === 0) {
                // Min
                result = parseInt(a.min) - parseInt(b.min);
              }
            }
          }
          return result;
        });
      }
    };
  });