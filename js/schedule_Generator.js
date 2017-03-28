/*
Note: Need to unify the duration nums: 1 or 15
*/

// Globals
const DAYS_ARR = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const NUM_DAYS = DAYS_ARR.length;
const th_TAG = document.createElement('th');
const NUM_STUDIO = 5;
const NUM_OPERAT = 7;

const BEGIN_HOUR = 9;
const BEGIN_MIN = 0;
const END_HOUR = 9;
const END_MIN = 0;

// Full Schedule
const INTVAL_FULL = 15;
const NUM_tROWS_FULL = get_TableRows(INTVAL_FULL);

// Sub Schedules
const INTVAL_SUB = 30;
const NUM_tROWS_SUB = get_TableRows(INTVAL_SUB);



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


function init_BaseTables_full() {
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



// Returns minutes interval within an hour
function get_MinInterval(gap) {
  return 60 / gap;
}

// Returns time format string: hh:mm:ampm
function get_TimeFormat(hour, min, Ms) {
  return `${hour}:${min} ${Ms}`;
}

// Return the number of table rows by time gap
function get_TableRows(timeGap) {
  return ((12 - BEGIN_HOUR) + END_HOUR) * (60 / timeGap);
}

// Extracts the time of begin and end from user input
function getClassEnds_toObj(hour, min, duration) {
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

  //Return an object
  return {
    "hour": end_hour,
    "min": end_min
  };
}

// Translates class level from user input to capitalize first letter
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

// Returns obj which contains the increased time
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
    row.classList.add('timeLine');
    convertedMin = get_MinsByTimeGap(i, INTVAL_FULL);
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




// Adds a class on the schedule
// function add_Class(className, type, level, day_input, hour, min, duration, studio_input) {
function add_Class(info) {
  const c_Name = info.name; // Translated Classname
  const c_Type = info.type.toLowerCase();
  const c_Level = get_ClassLevel(info.level.toLowerCase()); // Convert level
  const c_daysIdx = DAYS_ARR.indexOf(info.day); // Day idx from DAYS_ARR arr

  // Get class begin from DB input
  const c_beginHour = parseInt(info.hour);
  const c_beginMin = parseInt(info.min);

  // Get class ends by "getClassEnds_toObj" which returns object
  const c_End = getClassEnds_toObj(info.hour, info.min, info.duration);
  const c_endHour = c_End.hour;
  const c_endMin = c_End.min;


  // Select the position in schedule will be added
  const newClass_position = document.querySelector(`.h_${c_beginHour}.m_${get_string00(c_beginMin)}>.${info.day}.studio${info.studio}`);

  // Rowspan
  const rowspan = info.duration / INTVAL_FULL;
  newClass_position.rowSpan = `${rowspan}`;


  const template =
    `<div class="level-label ${c_Type}-class"></div>
    <p class="className-label"><b>${c_Name}</b><br> ${get_HourByTwelve(c_beginHour)}:${get_string00(c_beginMin)}-${get_HourByTwelve(c_endHour)}:${get_string00(c_endMin)}
      <br> ${(c_Level)}
    </p>`;

    
  // Adds the template for new class
  newClass_position.innerHTML = template; 

  // Removes <td>s after rowspan
  let span_num = c_beginMin;
  let extra_Hour = 0;
  let i = 0;

  for (i; i < rowspan - 1; i++) {
    span_num += INTVAL_FULL;
    if (span_num >= 60) {
      extra_Hour++;
      span_num = 0;
    }

    // Remove <td>s after rowspan
    document.querySelector(`.h_${get_HourByTwelve(c_beginHour + extra_Hour)}.m_${get_string00(span_num)}>.${info.day}.studio${info.studio}`).remove();
  }

  // Remove boder-day class, if the position contains it
  if (newClass_position.classList.contains("border-day")) {
    newClass_position.classList.remove("border-day");
  }

  // Add classes for adding class
  newClass_position.classList.add("onClass", "class-border", `${info.level.toLowerCase()}-class`);

}


function create_Structure_sub() {
  const type = "ballet"; // Mock type

  const container = document.querySelector('#subScheduleContainer');

  // Desktop Version Sub Schedule
  const desktop = document.createElement('div');
  desktop.className = "table-container table-responsive desktop-schedule"

  const d_tbl = document.createElement('table');
  d_tbl.id = `schedule-${type}-desktop`;
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
    convertedMin = get_MinsByTimeGap(i, INTVAL_SUB);
    row.className = `h_${time.hour} m_${convertedMin}`;

    let j = 0;
    for (j; j < NUM_DAYS + 1; j++) {
      const temp = row.insertCell(j);
      if (j === 0) {
        temp.className = "timeLine";
        // row.classList.add();
        temp.innerHTML = get_TimeFormat(time.hour, convertedMin, time.ampm);
        time = get_IncreasingTime(time, INTVAL_SUB); //here
      } else {
        temp.className = DAYS_ARR[j - 1];
      }
    }
  }
  desktop.appendChild(d_tbl);
  container.appendChild(desktop);


  // Mobile Version Sub Schedule
  const mobile = document.createElement('div');
  mobile.className = "table-container table-responsive mobile-schedule";

  const m_tbl = document.createElement('table');
  m_tbl.id = `schedule-${type}-mobile`;
  m_tbl.className = "table table-bordered table-condensed table-hover table-striped";

  const m_tbl_header = m_tbl.createTHead().insertRow(0);
  m_tbl_header.appendChild(th_TAG.cloneNode(true));
  m_tbl_header.appendChild(th_TAG.cloneNode(true)).innerHTML = "Time";
  m_tbl_header.appendChild(th_TAG.cloneNode(true)).innerHTML = "Class";

  const m_tbl_body = m_tbl.createTBody();


  mobile.appendChild(m_tbl);
  container.appendChild(mobile);
}


function get_roundedMin(min, intval) {
  const mod = min % intval;
  if (mod !== 0) {
    min -= mod;
  }
  return min;
}

function add_Class_sub(className, type, level, day_input, hour, min, duration, studio_input) {
  const c_Name = className; // Translated Classname
  const c_Type = type.toLowerCase();
  const c_Level = get_ClassLevel(level.toLowerCase()); // Convert level
  const c_daysIdx = DAYS_ARR.indexOf(day_input); // Day idx from DAYS_ARR arr

  // Get class begin from DB input
  const c_beginHour = parseInt(hour);
  const c_beginMin = get_roundedMin(parseInt(min), INTVAL_SUB);

  // Get class ends by "getClassEnds_toObj" which returns object
  const c_End = getClassEnds_toObj(hour, min, duration);
  const c_endHour = c_End.hour;
  const c_endMin = c_End.min;

  const newClass_position = document.querySelector(`.h_${c_beginHour}.m_${get_string00(c_beginMin)}>.${day_input}`);
  newClass_position.classList.add("onClass", "pre-class", "class-border");

  const template = `<p><strong>${c_Name}</strong><br>
  ${get_HourByTwelve(c_beginHour)}:${get_string00(c_beginMin)}-${get_HourByTwelve(c_endHour)}:${get_string00(c_endMin)}<br>
  ${(c_Level)}</p>`;

  newClass_position.innerHTML = template;

  // Rowspan
  const rowspan = duration / INTVAL_SUB;
  newClass_position.rowSpan = `${rowspan}`;

  // Removes <td>s after rowspan
  let span_num = c_beginMin;
  let extra_Hour = 0;
  let i = 0;

  for (i; i < rowspan - 1; i++) {
    span_num += INTVAL_SUB;
    if (span_num >= 60) {
      extra_Hour++;
      span_num = 0;
    }
    document.querySelector(`.h_${get_HourByTwelve(c_beginHour + extra_Hour)}.m_${get_string00(span_num)}>.${day_input}`).remove();

  }

}

// function create_subClassTable() {
//   const tableContainer = document.createElement('div');
//   const table = document.createElement('table');

//   const mockName = "test";

//   tableContainer.appendChild(table);
//   tableContainer.className = 'table-container table-responsive desktop-schedule';
//   table.id = `schedule-${mockName}-desktop`;
//   table.className = 'table table-bordered table-condensed table-hover';

//   const thead_row = table.createTHead().insertRow();

//   thead_row.appendChild(th_TAG.cloneNode(true)).className = 'timeLine';

//   // Add <th> tag into thead row (Mon-Sun)
//   DAYS_ARR.forEach(function (element) {
//     thead_row.appendChild(th_TAG.cloneNode(true)).innerHTML = element;
//   });

//   const thead_length = table.rows[0].cells.length,
//     tbody = table.createTBody(),
//     rows = get_TableRows(30);



//   console.log(tableContainer);
//   document.getElementById('container_sub').appendChild(tableContainer);

// }

// function create_SubMobileTable(target, name) {
//   const sort_t = document.querySelector(target),
//     div_t = document.createElement('div'),
//     table_t = document.createElement('table'),
//     menus_t = ["", "Time", "Class"];

//   div_t.className = 'table-container table-responsive mobile-schedule';
//   table_t.id = `schedule-${name}-mobile`;
//   table_t.className = 'table table-bordered table-condensed table-hover table-striped';

//   let table_scope = table_t.createTHead().insertRow();
//   menus_t.forEach(function (element) {
//     const added_cell = table_scope.appendChild(th_TAG.cloneNode(true));
//     added_cell.innerHTML = element;
//   });

//   table_scope = table_t.createTBody();

//   const class_t = document.querySelectorAll(classObjects[num_Level].name);
//   if (class_t.length !== 0) {
//     console.log(class_t);
//   }

//   div_t.appendChild(table_t);
//   sort_t.appendChild(div_t);
// }