'use strict'
/*
 * This is API for Crescendo Dance Academy in Bellevue, WA
 * 
 * This API contains functions for generating web contents with
 * options retrieved from server.
 * 
 * */


/*
 * Global Variables
 */

// These variables will be defined after retrieving data from server
let SCHEDULE_NUM, SCHEDULE_TYPE, SUB_TYPE, DAYS_ARR, NUM_DAYS, STUDIO_ARR, NUM_STUDIO, TYPE_ARR, TYPE_LABEL, LEVEL_ARR, LEVEL_LABEL, SCHEDULE_NAME, SCHEDULE_NOTICE;

// These variables for the show/hide for selecting class level or type
let ALL_TYPE_LEVEL, ACTIVE_FLAG_SHOWHIDE, PREV_SELECTED, PREV_SELECTED_IDX;

// TODO: It needs to be replaced the value from server
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

const th_TAG = document.createElement('th'); // <th></th>


/*
 * Handlers: Controls the generating class schedule dynamically
 */

// Initialize the structure of full schedule table
function generate_Full_Schedule() {
    /* Create Empty Schedule Table */
    create_Structure_full(); // Foundation
    create_tRow_Days(); // Rows
    create_tRow_Studio(); // Studios
    create_tCol_Timeline(); // Timeline
    create_table_classSchedule(); // Empty Class area

    // Url of full class info json from server
    const url_full_schedule = `https://crescendoschedulizer.firebaseio.com/class${SCHEDULE_NUM}.json?orderBy="dayIdx"&print=pretty`;

    /* Modify Empty Schedule by retrieved class info from server */
    get_Json_from_server(url_full_schedule, retrieve_Class, null);
}

// Initialize the structure of sub schedule table
function generate_Sub_Schedule() {
    // Create Menu for selecting different class schedules, only if active schedules are more than one
    (SCHEDULE_NUM === 2) && create_Menu_Tab_sub();

    create_Table_Desktop_sub(1); // For desktop version
    create_Table_Mobile_sub(1); // For mobile version

    // Url of filtered class info json from server based on the sub type requested
    const url_sub_schedule = `https://crescendoschedulizer.firebaseio.com/class${1}.json?orderBy=%22type%22&equalTo=%22${SUB_TYPE}%22&print=pretty`;
    /* Modify Empty Schedule by retrieved class info from server */
    get_Json_from_server(url_sub_schedule, retrieve_Class, 1);

    if (SCHEDULE_NUM === 2) {
        create_Table_Desktop_sub(SCHEDULE_NUM);
        create_Table_Mobile_sub(SCHEDULE_NUM);

        const url_sub_schedule2 = `https://crescendoschedulizer.firebaseio.com/class${SCHEDULE_NUM}.json?orderBy=%22type%22&equalTo=%22${SUB_TYPE}%22&print=pretty`;
        get_Json_from_server(url_sub_schedule2, retrieve_Class, SCHEDULE_NUM);
    }
}

// Initializer of generating class schedule for Crescendo
function init_Crescendo_Schedule() {
    const args_checker = args_Handler(Array.from(arguments)); // Deals with arguments dynamically
    const url_setting = `https://crescendoschedulizer.firebaseio.com/setting.json`;

    // Retrieve setting from server, only if arguments are legal
    args_checker && get_Json_from_server(url_setting, retrieve_Setting, null); // Sus

}

// Prevents the illegal arguments for initializing a schedule
function args_Handler(args) {
    // Full Schedule Case
    if (args.length === 2 && args[1] == 'full' && (args[0] === 1 || args[0] === 2)) {
        SCHEDULE_NUM = args[0];
        SCHEDULE_TYPE = args[1];
        SUB_TYPE = null; // Full schedule does not need second arg as sub type
        event_Handler(); // Set event handler for filtering class and fixed menus, if it is full schedule
        return true;

        // Sub Schedule Case
    } else if (args.length === 3 && args[1] == 'sub' && (args[0] === 1 || args[0] === 2)) {
        SCHEDULE_NUM = args[0];
        SCHEDULE_TYPE = args[1];
        SUB_TYPE = args[2];
        return true;

        // Otherwise it is illegal arguments
    } else {
        alert(`Illegal arguments within the initializing function for the schedule`);
        return false;
    }
}

// Display the announcement bar based on setting on DB
function announcement_Handler(object) {
    if (object.active === true) {
        const data = object.content.split(","); // 0: text, 1: link url

        // Make anchor empty string,if user deactivate a link 
        let link_template = "";
        if (object.link === true) { // Otherwise set anchor tag with url from server
            link_template = `, <a href="${data[1]}" target="_blank"><b>Click Here!</b></a>`;
        }

        const notice_Template = `  
       <div class="alert alert-danger alert-dismissable">
          <a href="#" class="close" data-dismiss="alert" aria-label="close">×</a>
          <strong>Notice!</strong> ${data[0]}${link_template}
        </div>`;

        document.getElementById("notice-container").innerHTML = notice_Template;
    }
}



/*
 * Class Schedule Generator
 * */

// Set label colors following type and level
function label_Handler() {
    // Whether full or sub schedule
    if (SCHEDULE_TYPE == "full") { // For full Schedule
        TYPE_ARR.forEach(function (element, index) {
            set_ClassBGColor(element, TYPE_LABEL[index]);
        });
    } else { // For sub schedules
        set_ClassBGColor(SUB_TYPE, TYPE_LABEL[TYPE_ARR.indexOf(SUB_TYPE)]);
    }

    // Level
    LEVEL_ARR.forEach(function (element, index) {
        set_ClassBGColor(element, LEVEL_LABEL[index]);
    });

}

// Set bg color based on selected query
function set_ClassBGColor(classSort, color) {
    // Set all the selected class query's background 
    const query = document.querySelectorAll(`.${classSort.replace(" ", "").toLowerCase()}-class`);
    query.forEach(function (selected) {
        selected.style.backgroundColor = color;
    });
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

    let i = 0;

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

    let i = 0,
        count = 1,
        count_Days = 0;

    for (i; i < (1 + (NUM_STUDIO * NUM_DAYS)); i++) {

        const temp = row_Studios.appendChild(th_TAG.cloneNode(true));

        if (i === 0) {
            temp.classList.add("head-topLeft");
        } else if (i > 0) {
            // Add border on studio for each day
            if (count === 1) {
                temp.classList.add("border-day", `${DAYS_ARR[count_Days]}`);
                count_Days++;
            }

            // Add the number of studio
            temp.innerHTML += `Stuidio ${STUDIO_ARR[count-1]}`;
            count++;
            count = count % 6;

            // Reset studio count
            count = count === 0 ? count = 1 : count;
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
        time = get_IncreasingTime(time, INTVAL_FULL); // Increase the time
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
            (hour === 24) ? hour = 0: hour; // Hour changes to 0, if it reaches to 24
            min = 0;
        }
    }
}

// Create menu btns tab for selecting different schedules in each sub class page
function create_Menu_Tab_sub() {
    const root = document.querySelector('#subScheduleContainer');
    let btns = "";
    for (let i = 0; i < SCHEDULE_NUM; i++) {
        btns += `<button type="button" class="btn btn-default" onclick="subScheduleSelect_Handler(${i+1})">${SCHEDULE_NAME["schedule"+(i+1)]}</button>`;
    }

    root.innerHTML = `<div class="btn-group" role="group">${btns}</div>`;
}

function subScheduleSelect_Handler(scheduleNum) {
    const shadow = (scheduleNum === 1) ? 2 : 1;
    document.querySelector(`#${SCHEDULE_TYPE}-${SUB_TYPE.toLowerCase()}-${scheduleNum}`).style.display = "block";
    document.querySelector(`#${SCHEDULE_TYPE}-${SUB_TYPE.toLowerCase()}-${shadow}`).style.display = "none";
}

// Create empty table for sub schedule in desktop environment
function create_Table_Desktop_sub(scheduleNum) {
    const root = document.querySelector('#subScheduleContainer');

    const container = document.createElement('div');
    container.id = `${SCHEDULE_TYPE}-${SUB_TYPE.toLowerCase()}-${scheduleNum}`;

    // Hide if this is second schedule in sub schedule
    (scheduleNum === 2) && (container.style.display = "none");

    // Desktop Version Sub Schedule
    const desktop = document.createElement('div');
    desktop.className = "table-container table-responsive desktop-schedule";

    const d_tbl = document.createElement('table');
    d_tbl.id = `schedule-${SUB_TYPE.toLowerCase()}-desktop`;
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
    root.appendChild(container);

}

// Create empty table for sub schedule in mobile environment
function create_Table_Mobile_sub(scheduleNum) {
    const container = document.querySelector(`#${SCHEDULE_TYPE}-${SUB_TYPE.toLowerCase()}-${scheduleNum}`);

    const type = SUB_TYPE.toLowerCase();

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
    m_tbl_body.id = `schedule-${type}${scheduleNum}-mobile-body`;

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
function create_rowspan_full(newClass_position, day, begin_hour, begin_min, duration, studio, intval) {
    // Rowspan
    const rowspan = duration / intval;
    newClass_position.rowSpan = `${rowspan}`;

    // Removes <td>s after rowspan
    let span_num = begin_min,
        extra_Hour = 0,
        i = 0,
        flag = false;

    for (i; i < rowspan - 1; i++) {
        span_num += intval;
        if (span_num >= 60) {
            extra_Hour++;
            span_num = 0;
        }

        if (SCHEDULE_TYPE == "sub") { // for the schedule of each type
            document.querySelector(`.h_${get_HourByTwentyTwo(begin_hour + extra_Hour)}.m_${get_string00(span_num)}>.${day}`).remove();
        } else if (SCHEDULE_TYPE == "full") { // for the full schedule
            document.querySelector(`.h_${get_HourByTwentyTwo(begin_hour + extra_Hour)}.m_${get_string00(span_num)}>.${day}.studio${studio}`).remove();
        }
    }
}


// Adds a class on the full schedule
function add_Class_full(info) {
    const c_Type = info.type.replace(" ", "").toLowerCase();
    const c_Level = get_ClassLevel(info.level); // Convert level

    // Get class begin from DB input
    const c_beginHour = get_HourByTwentyTwo(parseInt(info.hour), info.ampm);
    const c_beginMin = parseInt(info.min);

    // Get class ends by "getClassEnds_toObj" which returns object
    const c_End = getClassEnds_toObj(info.hour, info.min, info.ampm, info.duration);

    // Select the position in schedule will be added
    const newClass_position = document.querySelector(`.h_${c_beginHour}.m_${get_string00(c_beginMin)}>.${info.day}.studio${info.studio}`);

    // Template HTML for full schedule
    const template =
        `<div class="level-label ${c_Type}-class"></div>
    <p class="className-label"><b>${info.name}</b><br> ${get_HourByTwelve(c_beginHour)}:${get_string00(c_beginMin)}-${get_HourByTwelve(c_End.hour)}:${get_string00(c_End.min)}
      <br> ${(c_Level)}
    </p>`;


    // Adds the template for new class
    newClass_position.innerHTML = template;

    // Rowspan after adding new class
    create_rowspan_full(newClass_position, info.day, c_beginHour, c_beginMin, info.duration, info.studio, INTVAL_FULL);

    // Remove border-day class, if the position contains it
    if (newClass_position.classList.contains("border-day")) {
        newClass_position.classList.remove("border-day");
    }

    // Add classes for adding class
    // Warning: Do not switch the class sequence (showHideSchedule.js line: 61 might affected)  
    newClass_position.classList.add("onClass", `${info.level.replace(" ", "").toLowerCase()}-class`, "class-border");
}

// Adds a class on the sub schedule for each types in desktop environment
function add_Class_sub(info, idx) {
    const c_Type = info.type.replace(" ", "").toLowerCase();
    const c_Level = get_ClassLevel(info.level); // Convert level

    // Get class begin from DB input
    const c_beginHour = parseInt(info.hour);
    const c_beginMin = get_roundedMin(parseInt(info.min), INTVAL_SUB);

    // Get class ends by "getClassEnds_toObj" which returns object
    const c_End = getClassEnds_toObj(info.hour, info.min, info.ampm, info.duration);
    // Select the position where the new class will be added
    let newClass_position = document.querySelector(`#${SCHEDULE_TYPE}-${c_Type}-${idx} .h_${c_beginHour}.m_${get_string00(c_beginMin)}>.${info.day}`);
    // If the position is not existed or other class already on it
    if (newClass_position.classList.contains("onClass") === true || newClass_position === null) {
        // Create extra column for conflict schedule and returned new column's classname as day
        info.day = create_extraColumn(info.day, info.dayIdx, c_beginHour, c_beginMin);

        // Select new position which new inserted column on that day
        newClass_position = document.querySelector(`.h_${c_beginHour}.m_${get_string00(c_beginMin)}>.${info.day}`);
    }

    // Template HTML for full schedule
    const template =
        `<p class="className-label"><strong>${info.name}</strong><br>
		${get_HourByTwelve(c_beginHour)}:${get_string00(c_beginMin)}-${get_HourByTwelve(c_End.hour)}:${get_string00(c_End.min)}<br>
		${(c_Level)}</p>`;

    // Adds the template for new class
    newClass_position.innerHTML = template;

    // Rowspan after adding new class
    create_rowspan_full(newClass_position, info.day, c_beginHour, c_beginMin, info.duration, info.studio, INTVAL_SUB);

    // Warning: Do not switch the class sequence (showHideSchedule.js line: 61 might affected)
    newClass_position.classList.add("onClass", "class-border", `${info.level.replace(" ", "").toLowerCase()}-class`);

    // Also add class into sub schedule for mobile enviroment
    add_Class_sub_mobile(info.name, c_Type, info.level.replace(" ", "").toLowerCase(), info.day, DAYS_ARR.indexOf(info.day), c_beginHour, c_beginMin, info.ampm, c_End, idx);
}

// Adds a class on the sub schedule for each types in mobile environment
function add_Class_sub_mobile(name, type, level, day, dayIdx, begin_hour, begin_min, begin_ampm, ends, idx) {
    const t_body = document.getElementById(`schedule-${type}${idx}-mobile-body`);

    // Get index which class has been sorted based on the day and hour
    let insert_idx = get_SortedInsertRowIdx(type, dayIdx, begin_hour, idx);

    // Insert new row for inserting class
    const tr_mobile = t_body.insertRow(insert_idx);
    tr_mobile.className = `${day} h_${begin_hour} m_${begin_min}`;

    // Add day in first column
    const td_day = tr_mobile.insertCell(0);
    td_day.innerHTML = day;
    td_day.className = 'mobile_day';

    // Add time in second column
    const td_time = tr_mobile.insertCell(1);
    td_time.innerHTML = `${begin_hour}:${get_string00(begin_min)} ${begin_ampm}-${ends.hour}:${get_string00(ends.min)} ${ends.ampm}`;
    td_time.className = 'mobile_time';

    // Add name and level in third column
    const td_name = tr_mobile.insertCell(2);
    td_name.innerHTML = `<strong>${name}</strong><br>${get_ClassLevel(level)}`;
    td_name.className = `${level}-class`;
}

// Get index which the sorted location for inserting class in sub schedule in mobile
function get_SortedInsertRowIdx(type, dayIdx, hour, idx) {
    const tr_Tags = document.querySelectorAll(`#schedule-${type}${idx}-mobile-body > tr`);
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
function create_rowspan_sub_mobile(type, idx) {
    const tr_Tags = document.querySelectorAll(`#schedule-${type}${idx}-mobile-body > tr`);

    // Through all day
    DAYS_ARR.forEach(function (element) {
        const day_query = document.querySelectorAll(`#schedule-${type}${idx}-mobile-body > tr.${element}`);
        const num_query = day_query.length;

        // If any schedule on the day
        if (num_query > 0) {

            // If only one schedule on this day
            if ((num_query === 1) && (day_query[0].rowIndex !== tr_Tags.length)) {
                day_query[0].classList.add('day-border-bottom');
            } else if (num_query > 1) {
                // If more than one schedule on this day
                let i = 0;
                for (i; i < num_query; i++) {
                    if (i === 0) { // Rowspan first element
                        day_query[i].firstChild.rowSpan = (num_query).toString();
                    } else { // Remove all element after rowspan
                        day_query[i].firstChild.remove();

                        // When last class of this day and also not the last class of whole class
                        if ((i === (num_query - 1)) && (day_query[i].rowIndex !== tr_Tags.length)) {
                            day_query[i].classList.add('day-border-bottom');
                        }
                    }
                }
            }
        }
    });
}

// Extracts the time of begin and end from user input
function getClassEnds_toObj(hour, min, ampm, duration) {
    hour = parseInt(hour);
    min = parseInt(min);
    duration = parseInt(duration);

    let end_hour, end_min, count = 0;

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

// Get rounded minutes based on the interval minutes
function get_roundedMin(min, intval) {
    return (min % intval !== 0) ? min -= (min % intval) : min;
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

/*
 * Helper Function
 * */


// Helper: Translates class level from user input to capitalize first letter
function get_ClassLevel(className) {
    switch (className) {
        case "pre":
            return "(Pre)";
        case "kids":
            return "(Kids)";
        case "tracka":
            return "(Track A)";
        case "trackb":
            return "(Track B)";
        default:
            return `(${className})`;
    }
    // break statement does not needed because it returns string before break
}

// Helper: Convert hour from 24 to 12 hour based
function get_HourByTwelve(hour) {
    return (hour > 12) ? hour % 12 : hour;
}

// Helper: Convert hour from 12 to 24 hour based
function get_HourByTwentyTwo(hour, ampm) {
    return (ampm == "PM") ? (hour + 12) % 24 : hour;
}

// Helper: Translates single digit to mins
function get_MinsByTimeGap(index, gap) {
    const interval = get_MinInterval(gap);
    const calc_Min = 60 - gap * (interval - index % interval);
    return (calc_Min === 0) ? "00" : calc_Min.toString();
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
    return (num === 0) ? num = "00" : num;
}

// Helper: Check whether the Sub type of class is existing in list of class type from db
function subType_Handler() {
    return TYPE_ARR.includes(SUB_TYPE);
}

/*
 * RESTful API
 * */

// Async function: Get JSON data from server
function get_Json_from_server(url, callback, idx) {

    // Promise: will resolve after retrieving data from DB
    new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                resolve(xhr.responseText);
            }
        }
        xhr.open('GET', url, true);
        xhr.send();
    }).then((data) => {
        callback(data, idx);
    }).catch((err) => {
        // alert(`Sorry, the schedule is temporarily undergoing maintenance. We apologize for the inconvenience.`);
        console.log(err);
    });


    /**
     * Fetch API does not work on mobile devices
     */
    // // Retrieve data from server by Fetch API
    // fetch(url).then(function (response) {
    // 	return response.json();
    // }).then(function (data) {
    // 	// Callback the function after retrieving successfully
    // 	callback(data);
    // });
}

// Apply class info by retrieved data from DB
function retrieve_Class(json, idx) {
    json = JSON.parse(json); // Parse json from AJAX call
    const num_Class = Object.keys(json).length;

    new Promise((resolve, reject) => {
        Object.keys(json).forEach(function (element, index) {
            const single_class_info = json[element];

            // Add each class depends on the schedule type
            (SCHEDULE_TYPE == "full") ? add_Class_full(single_class_info): add_Class_sub(single_class_info, idx);

            // Resolve the promise, if all the class has been added
            (index === num_Class - 1) && resolve();

        });

        if (SCHEDULE_TYPE != "full") {
            // Rowspan days column in sub schedule for mobile environment
            create_rowspan_sub_mobile(SUB_TYPE.toLowerCase(), idx);
        }
    }).then(() => {
        label_Handler(); // Set label colors after create all the class schedule
    }).catch((err) => {
        // alert(`Sorry, the schedule is temporarily undergoing maintenance. We apologize for the inconvenience.`);
        console.log(err);
    });

}

// Apply setting info by retrieved data from DB
function retrieve_Setting(json_setting) {
    json_setting = JSON.parse(json_setting); // Parse json from AJAX call

    // Set Global variables based on the setting retrieved from server in object
    DAYS_ARR = json_setting.day.split(",");
    NUM_DAYS = DAYS_ARR.length;

    STUDIO_ARR = json_setting.studio.split(",");
    NUM_STUDIO = STUDIO_ARR.length;

    TYPE_ARR = json_setting["type"].split(",");
    TYPE_LABEL = json_setting["label"]["type"].split(",");

    LEVEL_ARR = json_setting["level"].split(",");
    LEVEL_LABEL = json_setting["label"]["level"].split(",");

    // Set Global variables for the show/hide DOM event
    ALL_TYPE_LEVEL = LEVEL_ARR.concat(TYPE_ARR);
    ALL_TYPE_LEVEL = ALL_TYPE_LEVEL.map(function (element) {
        // Replace to lowercase and non space
        return element.replace(" ", "").toLowerCase();
    });

    SCHEDULE_NAME = json_setting.naming;
    SCHEDULE_NOTICE = json_setting.notice;

    // Array for storing whether show/hide function activated
    ACTIVE_FLAG_SHOWHIDE = new Array(TYPE_ARR.length + LEVEL_ARR.length).fill(false);



    if (SCHEDULE_TYPE == "full") {
        // Create a full schedule of classes
        generate_Full_Schedule();

        // Set announcement bar for the full schedule
        announcement_Handler(json_setting.notice["schedule" + SCHEDULE_NUM]);

    } else if (SCHEDULE_TYPE == "sub") {
        // Check whether class type is legal
        // The reason why SUB_TYPE var checks at here is that
        // the variable needs to compared after data retrieved from server
        subType_Handler() ? generate_Sub_Schedule(SUB_TYPE) : alert(`Error: ${SUB_TYPE} is not existing in the list of our class types`);
    }
}



/**
 * Filtering following class level or type
 */


// Called with EventListener which handling class filter on the full student schedule
function opacity_Handler(event) {
    // Verify the input type or level by contained className
    const event_target = event.target;
    const target_classList = event.target.classList[0];

    // When user click class type label area
    if (target_classList === 'className-label' || event_target.localName === 'b') {
        // It may clicked with <b> tag on the className-label <p>, thus it needs to set one more step above by parentNode
        // It cannot be used by event.path or event.srcElement. These are not standard. Only for Chrome browser
        let selected_class_type;
        (event_target.localName === "b") ? selected_class_type = event_target.parentNode.parentNode.classList[3]: selected_class_type = event_target.parentNode.classList[3];

        const target_toSolid = document.querySelectorAll(`.onClass.${selected_class_type} > .level-label`),
            target_toBlur = document.querySelectorAll(`.onClass:not(.${selected_class_type}) > .level-label`);
        set_Opacity_toBlur(selected_class_type, target_toSolid, target_toBlur);

        // When user click level label area
    } else if (target_classList === 'level-label') {
        const selected_class_level = event_target.classList[1],
            target_toSolid = document.querySelectorAll(`.level-label.${selected_class_level}`),
            target_toBlur = document.querySelectorAll(`.level-label:not(.${selected_class_level})`);
        set_Opacity_toBlur(selected_class_level, target_toSolid, target_toBlur);
    }
}

// Set opacity of class schedule based on the user click by EventListener
function set_Opacity_toBlur(targetClass, selected, notSelected) {
    const idx = ALL_TYPE_LEVEL.indexOf(targetClass.replace("-class", "")); // Remove '-class'

    if ((ACTIVE_FLAG_SHOWHIDE[idx] !== true && PREV_SELECTED === undefined) || ACTIVE_FLAG_SHOWHIDE[idx] !== true && PREV_SELECTED === targetClass) {
        // When label selected first time or again
        notSelected.forEach(function (tag) {
            tag.parentNode.style.opacity = 0.2;
        });

        // Active Flag: whether specific class has been selected or not
        ACTIVE_FLAG_SHOWHIDE[idx] = true;

        // Store selected class type or level
        PREV_SELECTED = targetClass;
        PREV_SELECTED_IDX = idx;

    } else if (ACTIVE_FLAG_SHOWHIDE[idx] !== true && PREV_SELECTED !== targetClass) {
        // When label selected after different label has been selected
        notSelected.forEach(function (tag) {
            tag.parentNode.style.opacity = 0.2;
        });

        selected.forEach(function (tag) {
            tag.parentNode.style.opacity = 1;
        })

        // Activated new class and deactivated prev class
        ACTIVE_FLAG_SHOWHIDE[idx] = true;
        ACTIVE_FLAG_SHOWHIDE[PREV_SELECTED_IDX] = false;

        // Store selected class type or level
        PREV_SELECTED = targetClass;
        PREV_SELECTED_IDX = idx;

    } else {
        // Restore opacity
        notSelected.forEach(function (tag) {
            tag.parentNode.style.opacity = 1;
        });
        ACTIVE_FLAG_SHOWHIDE[PREV_SELECTED_IDX] = false;
    }
}

// Filtering class and fixed timeline and header tables event handler
function event_Handler() {
    // EventListener to handle clicking classes for filtering results
    document.addEventListener('click', (event) => opacity_Handler(event), false);

    window.onscroll = function (e) {
        // The value of height for top margin of class schedule (#right-schedule)
        const fixed_MarginTop = document.querySelector("#top-tbl").firstChild.clientHeight;

        const body1 = document.body; // body tag selector, for Chrome, Safari and Opera		
        const body2 = document.documentElement; // body tag selector, for Firefox and IE places the overflow at the <html> level
        const timeLine = document.getElementById("left-timeLine"); // timeline table selector
        const headerTable = document.getElementById("header-days"); // header days table selector


        if (body2.scrollTop === 0 && body2.scrollLeft === 0) {
            // For Chrome, Safari and Opera		
            if (body1.scrollTop > -1) {
                timeLine.style.top = `${-body1.scrollTop + fixed_MarginTop - 3}px`;
            }

            if (body1.scrollLeft > -1) {
                headerTable.style.left = `${-body1.scrollLeft}px`;
            }
        } else if (body1.scrollTop === 0 && body1.scrollLeft === 0) {
            // Firefox and IE places the overflow at the <html> level
            if (body2.scrollTop > -1) {
                timeLine.style.top = `${-body2.scrollTop + fixed_MarginTop - 4}px`;
            }
            if (body2.scrollLeft > -1) {
                headerTable.style.left = `${-body2.scrollLeft - 1}px`;
            }
        }
    }

}