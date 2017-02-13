/*
Note: Need to unify the duration nums: 1 or 15
*/
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  th_tag = '<th></th>',
  table_rows = 48,
  studio_num = 5,
  operation = 7;

// Creates notice bar top of a window
function create_noticeBar(text, link, activate) {
  let flag;
  if (activate == true)
    flag = "inline-block";
  else
    flag = "none";

  const notice_Container = document.getElementById("notice-container"),
    notice_Template = `  
       <div class="alert alert-danger alert-dismissable">
          <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>
          <strong>Notice!</strong> ${text}, <a style="display: ${flag}" href="${link}"><b>Click Here!</b></a>
        </div>`;
  notice_Container.innerHTML = notice_Template;
}

// Creates Days columns including topLeft head
function create_DaysRow() {
  const rowDays_Container = document.getElementById("row-days");
  rowDays_Container.innerHTML += th_tag.repeat(8);

  // Select all <th>s I created above
  const th_tags = rowDays_Container.querySelectorAll('th');

  // Add class for topLeft head
  th_tags[0].classList.add("head-topLeft");
  for (let i = 1; i < th_tags.length; i++) {
    th_tags[i].innerHTML = days[i - 1];
    th_tags[i].colSpan = studio_num; //Colspan: num of studio
  }
}

// Creates studio columns
function create_StudioRow() {
  const rowStudio_Container = document.getElementById("row-studio");
  rowStudio_Container.innerHTML += th_tag.repeat(1 + (studio_num * operation));

  const ths = rowStudio_Container.querySelectorAll('th');
  ths[0].classList.add("head-topLeft");

  let i, count_Studio = 1,
    count_Days = 0;
  for (i = 1; i < ths.length; i++) {
    if (count_Studio === 0) {
      count_Studio = 1;
    }

    // Add border on studio for each day
    if (count_Studio === 1) {
      ths[i].classList.add("border-day", `${days[count_Days]}`);
      count_Days++;
    }

    // Add the number of studio
    ths[i].innerHTML += `Stuidio ${count_Studio}`;
    count_Studio++;
    count_Studio = count_Studio % 6;
  }
}

// Helper: Translates single digit to mins
function timeLine_MinGenerator(index) {
  switch (index) {
    case 0:
      return "00";
      break;
    case 1:
      return 15;
      break;
    case 2:
      return 30;
      break;
    case 3:
      return 45;
      break;
  }
}

function get_TimeFormat(hour, min, Ms) {
  return `${hour}:${min} ${Ms}`;
}

function get_TimeIncreased(time_array, timeGap) {
  time_array[1]+=timeGap;
  
  if (time_array[0] === 11 && time_array[1] === 60) { // Switch to PM from 12
    time_array[2] = "PM";
    time_array[0]++;
    time_array[1] = 0;
  } else if (time_array[0] === 12 && time_array[1] === 60) { // 12 hour mode
    time_array[0] = 1;
    time_array[1] = 0;
  } else if (time_array[1] === 60) {
    time_array[0]++;
    time_array[1] = 0;
  }
  return time_array;
}

// Creates timeline on the schedule
function create_Timeline(begin_hour, begin_min, AMPM, timeGap) {
  if (AMPM !== "AM" && AMPM !== "PM") {
    alert("Please add 'AM' or 'PM' on the third parameter of create_Timeline()");
    return;
  }
  const timeline_Tbl = document.getElementById("timeline_tbl");

  let time = [begin_hour, begin_min, AMPM];
  const min_interval = (60 / timeGap);

  for (let i = 0; i < table_rows + 1; i++) {
    let row = timeline_Tbl.insertRow(i).insertCell(0);
    row.classList.add('timeLine');

    convertedMin = timeLine_MinGenerator(i % min_interval);
    row.innerHTML = get_TimeFormat(time[0], convertedMin, time[2]);

    time = get_TimeIncreased(time, timeGap); // Increas the time
    console.log(time);
  }
}

// Creates an empty of schedule
function create_BaseSchedule() {
  const schedule_Tbl = document.getElementById('schedule_tbl');
  let num_Flag, min, hour = 9;

  for (let i = 0; i < table_rows; i++) {
    let row = schedule_Tbl.insertRow(i);

    num_Flag = i % 4;
    min = timeLine_MinGenerator(num_Flag);

    // Adds classes of hour and min for each row
    row.classList.add(`h_${hour}`, `m_${min}`);

    // row.innerHTML += template.repeat(7);
    for (let k = 0; k < days.length; k++) {
      row.innerHTML +=
        `<td class="${days[k]} studio1 border-day"></td>
        <td class="${days[k]} studio2"></td>
        <td class="${days[k]} studio3"></td>
        <td class="${days[k]} studio4"></td>
        <td class="${days[k]} studio5"></td>`;
    }

    // Adds borders for each hours' last row
    if (i % 4 === 3) {
      for (let j = 0; j < 5 * 7; j++) {
        row.querySelectorAll('td')[j].classList.add('border-hour');
      }
    }
    if (min === 45) {
      hour++;
    }
  }
}

// Helper: Translate double zero when num is 0
function create_OO(num) {
  if (num === 0) {
    return "00";
  } else {
    return num;
  }
}

// Extracts the time of begin and end from user input
function getBeginEnding_toArray(begin, duration) {
  const breakPoint = begin.indexOf(":"),
    begin_hour = parseInt(begin.substr(0, breakPoint)),
    begin_min = parseInt(begin.substr(breakPoint + 1, begin.length));

  let end_hour, end_min, count = 0;

  // Extract hours from duration mins
  while (begin_min + duration >= 60) {
    count++;
    duration -= 60;
  }
  end_hour = begin_hour + count;
  end_min = begin_min + duration;

  //Return an array
  return [begin_hour, begin_min, end_hour, end_min];
}

// Translates class level from user input to capitalize first letter
function get_ClassLevel(className) {
  switch (className) {
    case "P":
      return "(Pre)";
      break;
    case "K":
      return "(Kids)";
      break;
    case "A":
      return "(Track A)";
      break;
    case "B":
      return "(Track B)";
      break;
    default:
      return "";
      break;
  }
}

function get_LevelClassName(className) {
  switch (className) {
    case "P":
      return "pre";
      break;
    case "K":
      return "kids";
      break;
    case "A":
      return "trackA";
      break;
    case "B":
      return "trackB";
      break;
    default:
      return "normal";
      break;
  }
}

function handler_Hour(hour){
  if(hour>12){
    return hour % 12;
  }else{
    return hour;
  }
}
// Adds a class on the schedule
function add_Class(className, sort, level, day_input, begin, duration, studio_input) {
  const num_rowspan = duration / 15, // Num of rowspan needed
    c_Name = className, // Translated Classname
    c_Sort = sort,
    c_Level = get_ClassLevel(level), // Translated level
    c_Days = days.indexOf(day_input), // Index of day from array
    c_Times = getBeginEnding_toArray(begin, duration), // Array: time of class begin and end

    c_beginHour = c_Times[0],
    c_beginMin = c_Times[1],
    c_endHour = c_Times[2],
    c_endMin = c_Times[3],
    c_schedule = `${(c_Days * studio_num)+(studio_input-1)}`, // Calculated the coordinate of schedule's column will be added
    dayStudio_Col = document.querySelector(`.h_${c_beginHour}.m_${create_OO(c_beginMin)}>.${day_input}.studio${studio_input}`);

  let template =
    `<div class="level-label ${sort}-class"></div>
    <p><b>${c_Name}</b><br> ${handler_Hour(c_beginHour)}:${create_OO(c_beginMin)}-${handler_Hour(c_endHour)}:${create_OO(c_endMin)}
      <br> ${(c_Level)}
    </p>`,
    list_Classes = dayStudio_Col.classList,
    span_num = c_beginMin,
    extra_Hour = 0;

  // Rowspan
  dayStudio_Col.rowSpan = `${num_rowspan}`;

  // Removes <td>s after rowspan
  for (let i = 0; i < num_rowspan - 1; i++) {
    span_num += 15;
    if (span_num >= 60) {
      extra_Hour++;
      span_num = 0;
    }

    // Select and remove <td>s
    document.querySelector(`.h_${c_beginHour + extra_Hour}.m_${create_OO(span_num)}>.${day_input}.studio${studio_input}`).remove();
  }

  // Adds | removes classes
  if (list_Classes.contains("border-day")) {
    list_Classes.remove("border-day");
  }
  list_Classes.add("onClass", "class-border", `${get_LevelClassName(level)}-class`);

  // Adds the template for new class
  dayStudio_Col.innerHTML = template;
}