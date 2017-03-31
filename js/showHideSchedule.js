  const classSorts = [
    // ClassLevels
    "pre",
    "kids",
    "normal",
    "tracka",
    "trackb",

    // ClassNames
    "ballet",
    "jazz",
    "tap",
    "contemporary",
    "lyrical",
    "hiphop",
    "stretch",
    "acro",
    "rehearsal"
  ];
  const num_Level = 5; //Number of levels
  const num_Class = classSorts.length - num_Level; //Number of Class sorts

  // Global Variable: Containes object of all sort of classes
  var classObjects = [];
  var executedClass_Name;
  var executedClass_Key;
  var executedClass_Base;

  // Adding sort of classe objects into array
  function set_ClassObjects() {
    classSorts.forEach(function (element) {
      classObjects.push({
        name: `.${element}-class`,
        flag: false
      });
    });
  }

  // Get the index of object array contains className
  function get_IdxinObjectArray(className) {
    return classObjects.findIndex(obj => obj.name === `.${className}`);
  }


  // Opacity Controller
  function set_Opacity(event) {
    const target = event.target; //For label of each class sorts
    const currentTarget = event.currentTarget; // For the level of each class

    let selected, baseClass, key_Object, classes;

    // When clicking sorts of classes
    if (target.className.includes("level-label") === true) {
      selected = target.classList[1],
        baseClass = "level-label",
        key_Object = get_IdxinObjectArray(selected),
        classes = document.querySelectorAll(`.${baseClass}:not(.${selected})`);

      // When clicking levels of classes
    } else if (currentTarget.className.includes("onClass")) {
      selected = currentTarget.classList[3],
        baseClass = "onClass",
        key_Object = get_IdxinObjectArray(selected),
        classes = document.querySelectorAll(`.${baseClass}:not(.${selected})`);
    }


    // When clicking a class first time
    if (classObjects[key_Object].flag === false) {

      // Re-display hidden classes if other class already filtered before
      if (executedClass_Key !== undefined && executedClass_Name !== undefined && executedClass_Base !== undefined) {
        classObjects[executedClass_Key].flag = false;

        const previous = document.querySelectorAll(`.${executedClass_Base}:not(${executedClass_Name})`);
        previous.forEach(function (element) {
          if (executedClass_Base === "level-label") {
            element.parentNode.style.opacity = 1;
          } else if (executedClass_Base === "onClass") {
            element.style.opacity = 1;
          }
        });
      }

      // Hide the classes not selected
      classes.forEach(function (element) {
        if (baseClass === "level-label") {
          element.parentNode.style.opacity = 0.2;
        } else if (baseClass === "onClass") {
          element.style.opacity = 0.2;
        }
        classObjects[key_Object].flag = true;
      });

      // When clicking same class already displayed
    } else {
      classes.forEach(function (element) {
        if (baseClass === "level-label") {
          element.parentNode.style.opacity = 1;
        } else if (baseClass === "onClass") {
          element.style.opacity = 1;
        }
        classObjects[key_Object].flag = false;
      });
    }

    // Stores class name, key and base class which is flag I used
    executedClass_Name = classObjects[key_Object].name;
    executedClass_Key = key_Object;
    executedClass_Base = baseClass;
  }

  // Initialize to set class info into object
  set_ClassObjects();

  // Controller
  $(document).ready(function () {
    $(document).on('click', '.onClass', function (event){
      set_Opacity(event);
    });
  })

  