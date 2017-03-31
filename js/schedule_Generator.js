'use strict'

// Globals
const DAYS_ARR = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const NUM_DAYS = DAYS_ARR.length;
const th_TAG = document.createElement('th');

const NUM_STUDIO = 5;
const NUM_OPERAT = 7;
const BEGIN_HOUR = 9,
  END_HOUR = 9;
const BEGIN_MIN = 0,
  END_MIN = 0;

// Full Schedule
const INTVAL_FULL = 15;
const NUM_tROWS_FULL = get_TableRows(INTVAL_FULL);

// Sub Schedules
const INTVAL_SUB = 30;
const NUM_tROWS_SUB = get_TableRows(INTVAL_SUB);

// Global array which holding rowspan index for sub schedule 
let ROWSPAN_IDX_ARR = [1, 1, 1, 1, 1, 1, 1];
let MOBILE_CLASS_SORT_IDX = 0;

// Creates notice bar top of a window
function create_noticeBar(text, link, activate) {
  let flag;
  if (activate === true) {
    flag = "inline-block";
  } else {
    flag = "none";
  }

  const notice_Template = `  
       <div class="alert alert-danger alert-dismissable">
          <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>
          <strong>Notice!</strong> ${text}, <a style="display: ${flag}" href="${link}"><b>Click Here!</b></a>
        </div>`;

  document.getElementById("notice-container").innerHTML = notice_Template;
}

// Initialize the structure of full schedule table
function init_BaseTable_full() {
  /* Create notice bar (param: text, link, true/false to activate link) */
  // create_noticeBar("hello", "#", true);

  /* Creates basic structure of full schedule */
  create_Structure_full();

  /* Creates Days columns and Studio columns on the header */
  create_tRow_Days();
  create_tRow_Studio();

  /* Creates timeline on the schedule */
  create_tCol_Timeline();

  /* Creates an empty of schedule */
  create_table_classSchedule();
}

// Initialize the structure of sub schedule table
function init_BaseTable_sub(type) {
  create_Table_Desktop_sub(type);
  create_Table_Mobile_sub(type);
}

// Creates basic structure of full schedule
function create_Structure_full() {
  // Select root container
  const container = document.querySelector('#studentScheduleContainer');
  container.className = "container";

  // Header lines: day, studio
  const header_days = document.createElement('div');
  header_days.id = "header-days";

  const table = document.createElement('table');
  table.id = "top-tbl";
  table.className = "table table-bordered table-condensed table-hover";

  const header = table.createTHead();
  header.insertRow(0).id = "row-days";
  ``
  header.insertRow(1).id = "row-studio";

  header_days.appendChild(table);
  container.appendChild(header_days);

  // Left timeline table
  const left_schedule = document.createElement('div');
  left_schedule.id = "left-timeLine";
  container.appendChild(left_schedule);

  // Right schedule table
  const right_schedule = document.createElement('div');
  right_schedule.id = "right-schedule";
  container.appendChild(right_schedule);
}

// Creates Days columns including topLeft head
function create_tRow_Days() {
  const row_Days = document.getElementById("row-days");

  let i = 0

  // Create th tag as many as days + 1
  for (i; i < NUM_DAYS + 1; i++) {
    const temp = row_Days.appendChild(th_TAG.cloneNode(true));

    if (i === 0) {
      // Add topLeft head class into first th
      temp.classList.add("head-topLeft");
    } else if (i > 0) {
      temp.innerHTML = DAYS_ARR[i - 1]; // Add days
      temp.colSpan = NUM_STUDIO; // Colspan: num of studio
    }
  }
}

// Creates studio columns
function create_tRow_Studio() {
  const row_Studios = document.getElementById("row-studio");

  let i = 0;
  let count_Studio = 1;
  let count_Days = 0;

  for (i; i < (1 + (NUM_STUDIO * NUM_DAYS)); i++) {

    const temp = row_Studios.appendChild(th_TAG.cloneNode(true));

    if (i === 0) {
      temp.classList.add("head-topLeft");
    } else if (i > 0) {
      // Add border on studio for each day
      if (count_Studio === 1) {
        temp.classList.add("border-day", `${DAYS_ARR[count_Days]}`);
        count_Days++;
      }

      // Add the number of studio
      temp.innerHTML += `Stuidio ${count_Studio}`;
      count_Studio++;
      count_Studio = count_Studio % 6;

      // Reset studio count
      count_Studio = count_Studio === 0 ? count_Studio = 1 : count_Studio;
    }
  }
}

// Creates timeline on the schedule
function create_tCol_Timeline() {
  const selected = document.querySelector("#left-timeLine");
  const target_Table = document.createElement('table');

  // Add id and classes
  target_Table.id = 'timeline_tbl';
  target_Table.className = 'table table-bordered table-condensed';

  selected.appendChild(target_Table);

  const interval = get_MinInterval(INTVAL_FULL);

  let time = {
    hour: BEGIN_HOUR,
    min: BEGIN_MIN,
    ampm: "AM"
  }

  let i = 0;
  for (i; i < NUM_tROWS_FULL + 1; i++) {
    const row = target_Table.insertRow(i).insertCell(0);
    const convertedMin = get_MinsByTimeGap(i, INTVAL_FULL);
    row.classList.add('timeLine');
    row.innerHTML = get_TimeFormat(time.hour, convertedMin, time.ampm);
    time = get_IncreasingTime(time, INTVAL_FULL); // Increas the time
  }
}
// Create <td> each rows in #right-schedule
function create_tRow_Schedule(row, studio, flag) {
  const td_tag = document.createElement('td');
  let k = 0;
  for (k; k < NUM_DAYS; k++) {
    let i = 1
    for (i; i < studio + 1; i++) {
      let border = "";
      if (i === 1 && studio > 0) {
        border = ' border-day'; //Need a space in front
      }
      const temp = td_tag.cloneNode(true);
      temp.className = `${DAYS_ARR[k]} studio${i}${border}`;

      // If the row is the border of hours
      if (flag === true) {
        temp.classList.add('border-hour');
      }
      row.appendChild(temp);
    }
  }
}

// Creates an empty of schedule in #right-schedule
function create_table_classSchedule() {
  // Create table
  const target_Table = document.createElement('table');
  target_Table.id = 'schedule_tbl';
  target_Table.className = 'table table-bordered table-condensed table-hover';

  // Append Table into container
  const selected = document.querySelector("#right-schedule");
  selected.appendChild(target_Table);

  let hour = BEGIN_HOUR;
  let min = BEGIN_MIN;
  let i = 0;

  for (i; i < NUM_tROWS_FULL; i++) {
    // Create row and add classes each timeline
    const row = target_Table.insertRow(i);
    row.classList.add(`h_${hour}`, `m_${get_MinsByTimeGap(i, INTVAL_FULL)}`);

    const interval = get_MinInterval(INTVAL_FULL);

    // Create <td> tags 
    if (i % interval === interval - 1 && NUM_STUDIO > 0) {
      create_tRow_Schedule(row, NUM_STUDIO, true); // When the row is border between hours
    } else {
      create_tRow_Schedule(row, NUM_STUDIO, false);
    }

    // Increase the hour when min reaches to 60
    min += INTVAL_FULL;
    if (min === 60) {
      hour++;
      hour = get_HourByTwelve(hour);
      min = 0;
    }
  }
}

// Create empty table for sub schedule in dekstop environment
function create_Table_Desktop_sub(type) {
  const container = document.querySelector('#subScheduleContainer');

  // Desktop Version Sub Schedule
  const desktop = document.createElement('div');
  desktop.className = "table-container table-responsive desktop-schedule"

  const d_tbl = document.createElement('table');
  d_tbl.id = `schedule-${type.toLowerCase()}-desktop`;
  d_tbl.className = "table table-bordered table-condensed table-hover";

  const d_tbl_header = d_tbl.createTHead().insertRow(0);

  let i = 0;

  for (i; i < NUM_DAYS + 1; i++) {
    const temp = d_tbl_header.appendChild(th_TAG.cloneNode(true));
    if (i === 0) {
      temp.className = "timeLine";
    } else {
      temp.className = DAYS_ARR[i - 1];
      temp.innerHTML = DAYS_ARR[i - 1];
    }
  }

  const d_tbl_body = d_tbl.createTBody();
  const interval = get_MinInterval(INTVAL_SUB);
  let time = {
    hour: BEGIN_HOUR,
    min: BEGIN_MIN,
    ampm: "AM"
  }

  i = 0;
  for (i; i < NUM_tROWS_SUB + 1; i++) {
    const row = d_tbl_body.insertRow(i);
    const convertedMin = get_MinsByTimeGap(i, INTVAL_SUB);
    row.className = `row_timeLine h_${time.hour} m_${convertedMin}`;

    let j = 0;
    for (j; j < NUM_DAYS + 1; j++) {
      const temp = row.insertCell(j);
      if (j === 0) {
        temp.className = "timeLine";
        temp.innerHTML = get_TimeFormat(time.hour, convertedMin, time.ampm);
        time = get_IncreasingTime(time, INTVAL_SUB); //here
      } else {
        temp.className = DAYS_ARR[j - 1];
      }
    }
  }
  desktop.appendChild(d_tbl);
  container.appendChild(desktop);
}

// Create empty table for sub schedule in mobile environment
function create_Table_Mobile_sub(type) {
  const container = document.querySelector('#subScheduleContainer');
  type = type.toLowerCase();

  // Mobile Version Sub Schedule
  const mobile = document.createElement('div');
  mobile.className = "table-container table-responsive mobile-schedule";

  const m_tbl = document.createElement('table');
  m_tbl.id = `schedule-${type}-mobile`;
  m_tbl.className = "table table-bordered table-condensed table-striped";

  const m_tbl_header = m_tbl.createTHead().insertRow(0);

  m_tbl_header.appendChild(th_TAG.cloneNode(true));
  m_tbl_header.appendChild(th_TAG.cloneNode(true)).innerHTML = "Time";
  m_tbl_header.appendChild(th_TAG.cloneNode(true)).innerHTML = "Class";

  const m_tbl_body = m_tbl.createTBody();
  m_tbl_body.id = `schedule-${type}-mobile-body`;

  mobile.appendChild(m_tbl);
  container.appendChild(mobile);
}

// Create extra column for adding new class which conflict with the class already written on the schedule and rowspan
function create_extraColumn(day, dayIdx, begin_hour, begin_min) {
  // Insert one more column on that day
  const row = document.querySelectorAll(".row_timeLine");
  row.forEach(function (element) {
    element.insertCell(dayIdx + 2).className = `${day + ROWSPAN_IDX_ARR[dayIdx]}`;
  });

  // Colspan the day on <th> inserted new column
  document.querySelector(`.${day}`).colSpan = `${ROWSPAN_IDX_ARR[dayIdx]+1}`;

  // Switch the target day
  day = `${day+ROWSPAN_IDX_ARR[dayIdx]}`;

  // Increase the index of rowspan for that day
  ROWSPAN_IDX_ARR[dayIdx]++;

  return day;
}

// Remove <td> tags after rowspan the new class for full schedule
function create_rowspan_full(newClass_position, day, begin_hour, begin_min, duration, studio, intval, schedule_type) {
  // Rowspan
  const rowspan = duration / intval;
  newClass_position.rowSpan = `${rowspan}`;

  // Removes <td>s after rowspan
  let span_num = begin_min;
  let extra_Hour = 0;
  let i = 0,
    flag = false;

  for (i; i < rowspan - 1; i++) {
    span_num += intval;
    if (span_num >= 60) {
      extra_Hour++;
      span_num = 0;
    }

    if (schedule_type === "sub") { // for the schedule of each type
      document.querySelector(`.h_${get_HourByTwelve(begin_hour + extra_Hour)}.m_${get_string00(span_num)}>.${day}`).remove();
    } else if (schedule_type === "full") { // for the full schedule
      document.querySelector(`.h_${get_HourByTwelve(begin_hour + extra_Hour)}.m_${get_string00(span_num)}>.${day}.studio${studio}`).remove();
    }
  }
}


// Adds a class on the full schedule
function add_Class_full(info) {
  const c_Name = info.name; // Translated Classname
  const c_Type = info.type.toLowerCase();
  const c_Level = get_ClassLevel(info.level.toLowerCase()); // Convert level
  const c_daysIdx = DAYS_ARR.indexOf(info.day); // Day idx from DAYS_ARR arr

  // Get class begin from DB input
  const c_beginHour = parseInt(info.hour);
  const c_beginMin = parseInt(info.min);

  // Get class ends by "getClassEnds_toObj" which returns object
  const c_End = getClassEnds_toObj(info.hour, info.min, info.ampm, info.duration);
  const c_endHour = c_End.hour;
  const c_endMin = c_End.min;


  // Select the position in schedule will be added
  const newClass_position = document.querySelector(`.h_${c_beginHour}.m_${get_string00(c_beginMin)}>.${info.day}.studio${info.studio}`);

  // Template HTML for full scheule
  const template =
    `<div class="level-label ${c_Type}-class"></div>
    <p class="className-label"><b>${c_Name}</b><br> ${get_HourByTwelve(c_beginHour)}:${get_string00(c_beginMin)}-${get_HourByTwelve(c_endHour)}:${get_string00(c_endMin)}
      <br> ${(c_Level)}
    </p>`;


  // Adds the template for new class
  newClass_position.innerHTML = template;

  // Rowspan after adding new class
  create_rowspan_full(newClass_position, info.day, c_beginHour, c_beginMin, info.duration, info.studio, INTVAL_FULL, "full");

  // Remove boder-day class, if the position contains it
  if (newClass_position.classList.contains("border-day")) {
    newClass_position.classList.remove("border-day");
  }

  // Add classes for adding class
  // Warning: Do not switch the class sequence (showHideSchedule.js line: 61 might affected)  
  newClass_position.classList.add("onClass", `${info.level.toLowerCase()}-class`, "class-border");
}

// Adds a class on the sub schedule for each types in desktop environment
function add_Class_sub(info) {
  const c_Name = info.name; // Translated Classname
  const c_Type = info.type.toLowerCase();
  const c_Level = get_ClassLevel(info.level.toLowerCase()); // Convert level
  const c_Day = info.day; // Hold original day value
  const c_daysIdx = DAYS_ARR.indexOf(info.day); // Day idx from DAYS_ARR arr

  // Get class begin from DB input
  const c_beginHour = parseInt(info.hour);
  const c_beginMin = get_roundedMin(parseInt(info.min), INTVAL_SUB);

  // Get class ends by "getClassEnds_toObj" which returns object
  const c_End = getClassEnds_toObj(info.hour, info.min, info.ampm, info.duration);
  const c_endHour = c_End.hour;
  const c_endMin = c_End.min;
  const c_endAMPM = c_End.ampm;

  // Select the position where the new class will be added
  let newClass_position = document.querySelector(`.h_${c_beginHour}.m_${get_string00(c_beginMin)}>.${info.day}`);

  // If the position is not existed or other class already on it
  if (newClass_position.classList.contains("onClass") === true || newClass_position === null) {
    // Create extra column for conflict schedule and returned new column's classname as day
    info.day = create_extraColumn(info.day, info.dayIdx, c_beginHour, c_beginMin);

    // Select new position which new inserted column on that day
    newClass_position = document.querySelector(`.h_${c_beginHour}.m_${get_string00(c_beginMin)}>.${info.day}`);
  }

  // Template HTML for full scheule
  const template = `<p class="className-label"><strong>${c_Name}</strong><br>
  ${get_HourByTwelve(c_beginHour)}:${get_string00(c_beginMin)}-${get_HourByTwelve(c_endHour)}:${get_string00(c_endMin)}<br>
  ${(c_Level)}</p>`;

  // Adds the template for new class
  newClass_position.innerHTML = template;

  // Rowspan after adding new class
  create_rowspan_full(newClass_position, info.day, c_beginHour, c_beginMin, info.duration, info.studio, INTVAL_SUB, "sub");

  // Warning: Do not switch the class sequence (showHideSchedule.js line: 61 might affected)
  newClass_position.classList.add("onClass", "class-border", `${info.level.toLowerCase()}-class`);

  // Also add class into sub schedule for mobile enviroment
  add_Class_sub_mobile(c_Name, c_Type, info.level.toLowerCase(), c_Day, c_daysIdx, c_beginHour, c_beginMin, info.ampm, c_endHour, c_endMin, c_endAMPM);
}

// Adds a class on the sub schedule for each types in mobile environment
function add_Class_sub_mobile(name, type, level, day, dayIdx, begin_hour, begin_min, begin_ampm, end_hour, end_min, end_ampm) {
  const t_body = document.getElementById(`schedule-${type}-mobile-body`);

  // Get index which class has been sorted based on the day and hour
  let insert_idx = get_SortedInsertRowIdx(type, dayIdx, begin_hour);

  // Insert new row for inserting class
  const tr_mobile = t_body.insertRow(insert_idx);
  tr_mobile.className = `${day} h_${begin_hour} m_${begin_min}`;

  // Add day in first column
  const td_day = tr_mobile.insertCell(0);
  td_day.innerHTML = day;
  td_day.className = 'mobile_day';

  // Add time in second column
  const td_time = tr_mobile.insertCell(1);
  td_time.innerHTML = `${begin_hour}:${get_string00(begin_min)} ${begin_ampm}-${end_hour}:${get_string00(end_min)} ${end_ampm}`;
  td_time.className = 'mobile_time';

  // Add name and level in third column
  const td_name = tr_mobile.insertCell(2);
  td_name.innerHTML = `<strong>${name}</strong><br>${get_ClassLevel(level)}`;
  td_name.className = `${level}-class`;
}

// Get index which the sorted location for inserting class in sub schedule in mobile
function get_SortedInsertRowIdx(type, dayIdx, hour) {
  const tr_Tags = document.querySelectorAll(`#schedule-${type}-mobile-body > tr`);
  let result = 0;

  // Sorting class by day and time through existing <tr>s
  tr_Tags.forEach(function (element) {
    // Day index of comparison
    const comp_dayIdx = DAYS_ARR.indexOf(element.classList[0]);

    if (comp_dayIdx < dayIdx) {
      result = element.rowIndex;
    } else if (comp_dayIdx === dayIdx) {
      if (element.classList[1].split("_")[1] <= hour) {
        result = element.rowIndex;
      }
    }
  });
  return result;
}

// Rowspan the column of same day in mobile sub schedule
function create_rowspan_sub_mobile(type) {
  const tr_Tags = document.querySelectorAll(`#schedule-${type}-mobile-body > tr`);

  // Through all day
  DAYS_ARR.forEach(function (element) {
    const query = document.querySelectorAll(`#schedule-${type}-mobile-body > tr.${element}`);
    const num_query = query.length;

    // If any schedule on the day
    if (num_query !== 0) {
      if (num_query === 1) {
        query[0].classList.add('day-border-bottom');
      } else if (num_query > 1) {
        let i = 0;
        for (i; i < num_query; i++) {
          if (i === 0) { // Rowspan first element
            query[i].firstChild.rowSpan = (num_query).toString();
          } else { // Remove all element after rowspan
            query[i].firstChild.remove();
            if (i === (num_query - 1)) {
              query[i].classList.add('day-border-bottom');
            }
          }
        }
      }
    }
  });
}

// Get rounded minutes based on the interval minutes
function get_roundedMin(min, intval) {
  const mod = min % intval;
  if (mod !== 0) {
    min -= mod;
  }
  return min;
}

// Get minutes interval within an hour
function get_MinInterval(gap) {
  return 60 / gap;
}

// Get time format string: hh:mm:ampm
function get_TimeFormat(hour, min, Ms) {
  return `${hour}:${min} ${Ms}`;
}

// Get the number of table rows by time gap
function get_TableRows(timeGap) {
  return ((12 - BEGIN_HOUR) + END_HOUR) * (60 / timeGap);
}

// Extracts the time of begin and end from user input
function getClassEnds_toObj(hour, min, ampm, duration) {
  hour = parseInt(hour);
  min = parseInt(min);
  duration = parseInt(duration);

  let end_hour;
  let end_min;
  let count = 0;

  // Extract hours from duration mins
  while (min + duration >= 60) {
    count++;
    duration -= 60;
  }
  end_hour = hour + count;
  end_min = min + duration;

  // Switch AM/PM based on end hour
  if (hour < 12 && end_hour >= 12 && ampm === "AM") {
    ampm = "PM";
  } else if (hour < 12 && end_hour >= 12 && ampm === "PM") {
    ampm = "AM"
  }

  //Return an object
  return {
    "hour": end_hour,
    "min": end_min,
    "ampm": ampm
  };
}

// Helper: Translates class level from user input to capitalize first letter
function get_ClassLevel(className) {
  switch (className) {
    case "pre":
      return "(Pre)";
      break;
    case "kids":
      return "(Kids)";
      break;
    case "tracka":
      return "(Track A)";
      break;
    case "trackb":
      return "(Track B)";
      break;
    default:
      return "";
      break;
  }
}

// Helper: Conver hour from 24 to 12 hour based
function get_HourByTwelve(hour) {
  if (hour > 12) {
    return hour % 12;
  } else {
    return hour;
  }
}

// Helper: Translates single digit to mins
function get_MinsByTimeGap(index, gap) {
  const interval = get_MinInterval(gap);
  const calc_Min = 60 - gap * (interval - index % interval);
  if (calc_Min === 0) {
    return "00";
  } else {
    return calc_Min.toString();
  }
}

// Helper: Returns obj which contains the increased time
function get_IncreasingTime(obj, gap) {
  obj.min += gap;

  if (obj.hour === 11 && obj.min === 60) { // Switch to PM from 12
    obj.ampm = "PM";
    obj.hour++;
    obj.min = 0;
  } else if (obj.hour === 12 && obj.min === 60) { // 12 hour mode
    obj.hour = 1;
    obj.min = 0;
  } else if (obj.min === 60) {
    obj.hour++;
    obj.min = 0;
  }
  return obj;
}

// Helper: Translate double zero when num is 0
function get_string00(num) {
  if (num === 0) {
    return "00";
  } else {
    return num;
  }
}



/*

Get Json file from the DB server

*/

const url_setting = `https://crescendoschedulizer.firebaseio.com/setting.json`;

// Get Json from 
function get_Json(url, schedule_type, callback) {
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
    callback(data, schedule_type)
  });
}

// Apply class info by retrieved data from DB
function retrieve_Class(json, type) {
  const parsed_Json = JSON.parse(json);
  const num_Class = Object.keys(parsed_Json).length;

  let async = new Promise((resolve, reject) => {
    Object.keys(parsed_Json).forEach(function (element, index) {
      const cls = parsed_Json[element];
      if (type === "full") {
        add_Class_full(cls);
      } else {
        add_Class_sub(cls);
      }

      if (index === num_Class - 1) {
        // Resolve the promise, if all the class has been added
        resolve();
      }
    });

    if (type !== "full") {
      // Rowspan days column in sub schedule for mobile environment
      create_rowspan_sub_mobile(type.toLowerCase());
    }
  });

  // Retrieve setting data from DB
  async.then(() => {
    get_Json(url_setting, type, retrieve_Setting);
  });

}

// Apply setting info by retrieved data from DB
function retrieve_Setting(json, classType) {
  const parsed_Json = JSON.parse(json);

  const type = get_splitValue(parsed_Json["type"]);
  const typeLabel = get_splitValue(parsed_Json["label"]["type"]);

  // Type
  if (classType === "full") { // For full Schedule
    type.forEach(function (element, index) {
      const query = document.querySelectorAll(`.${element.toLowerCase()}-class`);
      query.forEach(function (selected) {
        selected.style.backgroundColor = typeLabel[index];
      });
    });
  } else { // For sub schedules
    const typeIdx = type.indexOf(classType);
    const speicificLabel = typeLabel[typeIdx];

    const query = document.querySelectorAll(`.${classType.toLowerCase()}-class`);
    query.forEach(function (selected) {
      selected.style.backgroundColor = speicificLabel;
    });
  }

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

// initialize the class info for full schedule and setting from DB
function init_Class_full() {
  const url_full_schedule = `https://crescendoschedulizer.firebaseio.com/class.json?orderBy="dayIdx"&print=pretty`;
  get_Json(url_full_schedule, "full", retrieve_Class);
}

// initialize the class info for sub schedule and setting from DB
function init_Class_sub(type) {
  const url_sub_schedule = `https://crescendoschedulizer.firebaseio.com/class.json?orderBy=%22type%22&equalTo=%22${type}%22&print=pretty`;
  get_Json(url_sub_schedule, type, retrieve_Class);
}