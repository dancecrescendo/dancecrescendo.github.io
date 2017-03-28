'use strict'

const url = `https://crescendoschedulizer.firebaseio.com/class.json?orderBy="dayIdx"&print=pretty`;
const url_ballet = `https://crescendoschedulizer.firebaseio.com/class.json?orderBy=%22type%22&equalTo=%22Ballet%22&print=pretty`;
const setting = `https://crescendoschedulizer.firebaseio.com/setting.json`;


// Get Json from 
function get_Json(url, callback) {
  // Promise: will resolve after retrieving data from DB
  let async = new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        resolve(xhr.responseText);
      }
    }
    xhr.open('GET', url, true);
    xhr.send();
  });

  async.then((data) => {
    callback(data)
  });
}

// Apply class info by retrieved data from DB
function retrieve_Class(json) {
  const parsed_Json = JSON.parse(json);
  const num_Class = Object.keys(parsed_Json).length;

  let async = new Promise((resolve, reject) => {
    Object.keys(parsed_Json).forEach(function (element, index) {
      const cls = parsed_Json[element];
      add_Class(cls);

      if(index === num_Class - 1) {
        // Resolve the promise, if all the class has been added
        resolve();
      }
    });
  });

  // Retrieve setting data from DB
  async.then(() => {
    get_Json(setting, retrieve_Setting);
  });

}

// Apply setting info by retrieved data from DB
function retrieve_Setting(json) {
  const parsed_Json = JSON.parse(json);

  // Type
  const type = get_splitValue(parsed_Json["type"]);
  const typeLabel = get_splitValue(parsed_Json["label"]["type"]);

  type.forEach(function (element, index) {
    const query = document.querySelectorAll(`.${element.toLowerCase()}-class`);
    query.forEach(function (selected) {
      selected.style.backgroundColor = typeLabel[index];
    });
  });

  // Level
  const level = get_splitValue(parsed_Json["level"]);
  const levelLabel = get_splitValue(parsed_Json["label"]["level"]);

  level.forEach(function (element, index) {
    const query = document.querySelectorAll(`.${element.toLowerCase()}-class`);
    query.forEach(function (selected) {
      selected.style.backgroundColor = levelLabel[index];
    });
  });
}

// Split setting values by comma which data from DB
function get_splitValue(string) {
  return string.split(",");
}

// 
get_Json(url, retrieve_Class);