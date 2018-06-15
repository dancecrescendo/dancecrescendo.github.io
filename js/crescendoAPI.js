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
let SCHEDULE_NUM, SCHEDULE_TYPE, SUB_TYPE, DAYS_ARR, NUM_DAYS, STUDIO_ARR, NUM_STUDIO, TYPE_ARR, TYPE_LABEL, LEVEL_ARR, LEVEL_LABEL, SCHEDULE_NAME, SCHEDULE_NOTICE

// These variables for the show/hide for selecting class level or type
let ALL_TYPE_LEVEL, ACTIVE_FLAG_SHOWHIDE, PREV_SELECTED, PREV_SELECTED_IDX

// TODO: It needs to be replaced the value from server
const BEGIN_HOUR = 9
const END_HOUR = 9
const BEGIN_MIN = 0
const END_MIN = 0
const BEGIN_AMPM = "AM"

// Full Schedule
const INTVAL_FULL = 15
const numberOfRowsEachHours = getRowNumberByIntval(INTVAL_FULL)

// Sub Schedules
const INTVAL_SUB = 30
const NUM_tROWS_SUB = getRowNumberByIntval(INTVAL_SUB)

// Global array which holding rowspan index for sub schedule 
let ROWSPAN_IDX_ARR = [
	[1, 1, 1, 1, 1, 1, 1],
	[1, 1, 1, 1, 1, 1, 1]
]
let MOBILE_CLASS_SORT_IDX = 0

const th_TAG = document.createElement('th') // <th></th>


/*
 * Handlers: Controls the generating class schedule dynamically
 */

// Initialize the structure of full schedule table
function generateFullScheduleTemplate () {
	/* Create full schedule template */
	createFullScheduleStructure() // Foundation
	createDaysRow() // Rows
	createStudioRow() // Studios
	createTimelineCol() // Timeline
	createEmptySchedule() // Empty Class area
	createScheduleStructureMobile()

	/* Modify Empty Schedule by retrieved class info from server */
	const fullScheduleUrl = `https://crescendoschedulizer.firebaseio.com/class${SCHEDULE_NUM}.json?orderBy="dayIdx"`
	getDataFromServer(fullScheduleUrl, applyClassInfo)
}

// Initialize the structure of sub schedule table
function generateSubScheduleTemplate () {
	// Create Menu for selecting different class schedules, only if active schedules are more than one
	(SCHEDULE_NUM === 2) && createSubScheduleTabSelector();

	createSubScheduleStructureDesktop(1); // For desktop version
	createScheduleStructureMobile(1)

	// Url of filtered class info json from server based on the sub type requested
	const subScheduleUrl = `https://crescendoschedulizer.firebaseio.com/class${1}.json?orderBy=%22type%22&equalTo=%22${SUB_TYPE}%22`
	getDataFromServer(subScheduleUrl, applyClassInfo, 1)

	// If there are two different schedules
	if (SCHEDULE_NUM === 2) {
		createSubScheduleStructureDesktop(SCHEDULE_NUM)
		createScheduleStructureMobile(SCHEDULE_NUM)

		const subScheduleUrl2 = `https://crescendoschedulizer.firebaseio.com/class${SCHEDULE_NUM}.json?orderBy=%22type%22&equalTo=%22${SUB_TYPE}%22`
		getDataFromServer(subScheduleUrl2, applyClassInfo, SCHEDULE_NUM)
	}
}

// Initializer of generating class schedule for Crescendo
function initCrescendoSchedule () {
	const argsChecker = argsHandler(Array.from(arguments))
	const settingUrl = `https://crescendoschedulizer.firebaseio.com/setting.json`

	// Retrieve setting from server, only if arguments are legal
	argsChecker && getDataFromServer(settingUrl, applySetting)

}

// Prevents the illegal arguments for initializing a schedule
function argsHandler (args) {
	// Full Schedule Case
	if (args.length === 2 && args[1] == 'full' && (args[0] === 1 || args[0] === 2)) {
		SCHEDULE_NUM = args[0]
		SCHEDULE_TYPE = args[1]
		SUB_TYPE = null // Full schedule does not need second arg as sub type
		eventHandler() // Set event handler for filtering class and fixed menus, if it is full schedule
		return true

		// Sub Schedule Case
	} else if (args.length === 3 && args[1] == 'sub' && (args[0] === 1 || args[0] === 2)) {
		SCHEDULE_NUM = args[0]
		SCHEDULE_TYPE = args[1]
		SUB_TYPE = args[2]
		return true

		// Otherwise it is illegal arguments
	} else {
		console.error(`Illegal arguments within the initializing function for the schedule`)
		return false
	}
}

// Display the announcement bar based on setting on DB
function noticeHandler (object) {
	if (object.active === true) {
		const data = object.content.split(",") // 0: text, 1: link url

		// Make anchor empty string,if user deactivate a link 
		let link_template = "";

		// Otherwise set anchor tag with url from server
		(object.link === true) && (link_template = `, <a href="${data[1]}"><b>Click Here!</b></a>`)

		const noticeHTML = `  
       <div class="alert alert-${(SCHEDULE_NUM === 1) ? 'danger' : 'warning'} alert-dismissable">
          <a onClick="closeNoticebar()" id="close-notice-bar" class="close" data-dismiss="alert" aria-label="close">×</a>
          <strong>Notice!</strong> ${data[0]}${link_template}
        </div>`
    const noticeBar = document.getElementById("notice-container")
    noticeBar.addEventListener('click', () => {
      document.getElementById('close-notice-bar').click()
    })
    noticeBar.classList.add('display')
		noticeBar.innerHTML = noticeHTML
	}
}

function closeNoticebar () {
  document.getElementById("notice-container").classList.remove('display')
}

/*
 * Class Schedule Generator
 * */

// Set label colors following type and level
function labelHandler () {
	// Whether full or sub schedule
	if (SCHEDULE_TYPE == 'full') { // For full Schedule
		TYPE_ARR.forEach((element, index) => set_ClassBGColor(element, TYPE_LABEL[index]))
	} else { // For sub schedules
		set_ClassBGColor(SUB_TYPE, TYPE_LABEL[TYPE_ARR.indexOf(SUB_TYPE)])
	}

	// Level
	LEVEL_ARR.forEach((element, index) => set_ClassBGColor(element, LEVEL_LABEL[index]))

}

// Set bg color based on selected query
function set_ClassBGColor(classSort, color) {
	// Set all the selected class query's background 
	const query = document.querySelectorAll(`.${classSort.replace(' ', '').toLowerCase()}-class`)
	query.forEach(selected => selected.style.backgroundColor = color)
}

// Creates basic structure of full schedule
function createFullScheduleStructure () {
	// Select root container
	const container = document.getElementById('student-schedule-desktop')
	container.className = 'container'

	// Header lines: day, studio
	const header_days = document.createElement('div')
	header_days.id = 'header-days'

	const table = document.createElement('table')
	table.id = 'top-tbl'
	table.className = 'table table-bordered table-condensed table-hover'

	const header = table.createTHead()
	header.insertRow(0).id = 'row-days'
	header.insertRow(1).id = 'row-studio'

	header_days.appendChild(table)
	container.appendChild(header_days)

	// Left timeline table
	const left_schedule = document.createElement('div')
	left_schedule.id = 'left-timeLine'
	container.appendChild(left_schedule)

	// Right schedule table
	const right_schedule = document.createElement('div')
	right_schedule.id = 'right-schedule'
	container.appendChild(right_schedule)
}

// Creates Days columns including topLeft head
function createDaysRow () {
	const row_Days = document.getElementById('row-days')

	// Create th tag as many as days + 1
	let i = 0
	for (i; i < NUM_DAYS + 1; i++) {
		const newDay = row_Days.appendChild(th_TAG.cloneNode(true))

		if (i === 0) {
			// Add topLeft head class into first th
			newDay.classList.add('head-topLeft')
		} else {
			// Add days and colspan by number of studio
			newDay.innerHTML = DAYS_ARR[i - 1]
			newDay.colSpan = NUM_STUDIO
		}
	}
}

// Creates studio columns
function createStudioRow () {
	const row_Studios = document.getElementById('row-studio')

	let i = 0, studioCount = 1, dayCount = 0
	for (i; i < 1 + (NUM_STUDIO * NUM_DAYS); i++) {
		const newRow = row_Studios.appendChild(th_TAG.cloneNode(true));

		if (i === 0) {
			newRow.classList.add('head-topLeft')
		} else {
			// Add border on studio for each day
			if (studioCount === 1) {
				newRow.classList.add('border-day', `${DAYS_ARR[dayCount]}`)
				dayCount++
			}

			// Add the number of studio
			newRow.innerHTML += `Stuidio ${STUDIO_ARR[studioCount-1]}`
			studioCount++
			studioCount = studioCount % 6

			// Reset studio count
			studioCount = studioCount === 0 ? studioCount = 1 : studioCount
		}
	}
}

// Creates timeline on the schedule
function createTimelineCol () {
	const selected = document.querySelector('#left-timeLine')
	const target_Table = document.createElement('table')

	// Add id and classes
	target_Table.id = 'timeline_tbl'
	target_Table.className = 'table table-bordered table-condensed'

	selected.appendChild(target_Table)

	const interval = getMinutesByIntval(INTVAL_FULL)

	let time = {
		hour: BEGIN_HOUR,
		min: BEGIN_MIN,
		ampm: 'AM'
	}

	let i = 0
	for (i; i < numberOfRowsEachHours + 1; i++) {
		const row = target_Table.insertRow(i).insertCell(0)
		const convertedMin = convertMinutesToString(i, INTVAL_FULL)
		row.classList.add('timeLine')
		row.innerHTML = getTimeFormat(time.hour, convertedMin, time.ampm)
		time = getIncreasedTime(time, INTVAL_FULL) // Increase the time
	}
}

// Creates an empty of schedule in #right-schedule
function createEmptySchedule () {
	// Create table
	const target_Table = document.createElement('table')
	target_Table.id = 'schedule_tbl'
	target_Table.className = 'table table-bordered table-condensed table-hover'

	// Append Table into container
	const selected = document.querySelector("#right-schedule")
	selected.appendChild(target_Table)

	let hour = BEGIN_HOUR
	let min = BEGIN_MIN

	let i = 0
	for (i; i < numberOfRowsEachHours; i++) {
		// Create row and add classes each timeline
		const row = target_Table.insertRow(i)
		row.classList.add(`h_${hour}`, `m_${convertMinutesToString(i, INTVAL_FULL)}`)

		const interval = getMinutesByIntval(INTVAL_FULL);

		// Create <td> tags based on hour borders
		(i % interval === interval - 1 && NUM_STUDIO > 0) ? createEmptyCellsInSchedule(row, NUM_STUDIO, true) : createEmptyCellsInSchedule(row, NUM_STUDIO, false)

		let nextTime = getNextTimeByIntval(hour, min, "full")
		hour = nextTime.hour
		min = nextTime.min
	}
}

// Create <td> each rows in #right-schedule
function createEmptyCellsInSchedule (row, studioIdx, flag) {
	const td_tag = document.createElement('td')
	let k = 0
	for (k; k < NUM_DAYS; k++) {
		let i = 1
		for (i; i < studioIdx + 1; i++) {
			// Keep a space in front
			let border = (i === 1 && studioIdx > 0) ? ' border-day' : ''
			const newTableData = td_tag.cloneNode(true)
			newTableData.className = `${DAYS_ARR[k]} studio${i}${border}`

			// If the row is the border of hours
			flag === true && newTableData.classList.add('border-hour')
			row.appendChild(newTableData)
		}
	}
}

// Create menu btns tab for selecting different schedules in each sub class page
function createSubScheduleTabSelector() {
	const root = document.querySelector('#subScheduleContainer');
	let btns = "",
		active = "active"; // Flags

	for (let i = 0; i < SCHEDULE_NUM; i++) {
		(i === 1) && (active = ""); // Set active btn for initialize sub schedule
		btns += `<button id="schedule_btn${i+1}" type="button" class="btn btn-default ${active}" onclick="subScheduleSelect_Handler(${i+1})">${SCHEDULE_NAME["schedule"+(i+1)]}</button>`;
	}
	root.innerHTML = `<div class="btn-group" role="group">${btns}</div>`;
}

// Set display/hide for sub schedule
function subScheduleSelect_Handler(scheduleNum) {
	const shadow = (scheduleNum === 1) ? 2 : 1;

	// Hide and deactivate btn 
	document.querySelector(`#${SCHEDULE_TYPE}-${SUB_TYPE.toLowerCase()}-${shadow}`).style.display = "none";
	document.querySelector(`#schedule_btn${shadow}`).classList.remove("active");

	// Show and activate btn 
	document.querySelector(`#${SCHEDULE_TYPE}-${SUB_TYPE.toLowerCase()}-${scheduleNum}`).style.display = "block";
	document.querySelector(`#schedule_btn${scheduleNum}`).classList.add("active");
}

// Create empty table for sub schedule in desktop environment
function createSubScheduleStructureDesktop(scheduleNum) {
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
	const interval = getMinutesByIntval(INTVAL_SUB);

	let hour = BEGIN_HOUR;
	let min = BEGIN_MIN;
	let nextTime = null;

	i = 0;
	for (i; i < NUM_tROWS_SUB + 1; i++) {
		const row = d_tbl_body.insertRow(i);
		const convertedMin = convertMinutesToString(i, INTVAL_SUB);

		row.className = `row_timeLine h_${hour} m_${convertedMin}`;

		let j = 0;
		for (j; j < NUM_DAYS + 1; j++) {
			const temp = row.insertCell(j);
			if (j === 0) {
				let thisAMPM = (hour > 12) ? "PM" : "AM";

				temp.className = "timeLine";
				temp.innerHTML = getTimeFormat(getHourByTwelve(hour), convertedMin, thisAMPM);

				nextTime = getNextTimeByIntval(hour, min, "sub");
				hour = nextTime.hour;
				min = nextTime.min;

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
function createScheduleStructureMobile (scheduleId) {
	// Select container Id based on scheduleId
	const id = (!scheduleId) ? 'student-schedule-container' : `${SCHEDULE_TYPE}-${SUB_TYPE.toLowerCase()}-${scheduleId}`
	const container = document.getElementById(id)

	const mobile = document.createElement('div');
	mobile.className = "table-container table-responsive mobile-schedule"

	const m_tbl = document.createElement('table');
	m_tbl.id = (scheduleId) ? `schedule-${SUB_TYPE.toLowerCase()}-mobile` : 'student-schedule-mobile'
	m_tbl.className = "table table-bordered table-condensed table-striped"

	const m_tbl_header = m_tbl.createTHead().insertRow(0)

	m_tbl_header.appendChild(th_TAG.cloneNode(true))
	m_tbl_header.appendChild(th_TAG.cloneNode(true)).innerHTML = "Time"
	m_tbl_header.appendChild(th_TAG.cloneNode(true)).innerHTML = "Class"

	const m_tbl_body = m_tbl.createTBody();
	m_tbl_body.id = (scheduleId) ? `schedule-${SUB_TYPE.toLowerCase()}${scheduleId}-mobile-body`: 'student-schedule-mobile-body'

	mobile.appendChild(m_tbl)
	container.appendChild(mobile)
}

// Check availabilities of cell in the range of class duration
function checkCellSpace (schedule_num, day, dayIdx, hour, min, duration, type, col_num) {
	// Column number handler: 0 -> ""
	(col_num === 0) && (col_num = "")

	while (duration > 0) {
		const target = document.querySelector(`#${SCHEDULE_TYPE}-${type}-${schedule_num} .h_${hour}.m_${getString00(min)} > .${day + col_num}`)

		if (target === null || target.classList.contains("onClass") === true) {
			return true
		}

		// Minutes
		min += INTVAL_SUB;
		(min === 60) && (min = 0, hour++)

		// Duration
		duration -= INTVAL_SUB;
		(duration <= 15) && (duration = 0)
	}
	return false
}

// Create extra column for adding new class which conflict with the class already written on the schedule and rowspan
// This function only called with subschedules in each individual type
function createExtraColumn (args) {
	const { dayIdx, begin_hour, begin_min, classType, idx } = args
	let { day } = args

	// Insert one more column on that day
	const row = document.querySelectorAll(`#${SCHEDULE_TYPE}-${classType}-${idx} .row_timeLine`)

	row.forEach(element => {
		if (!element.childNodes[dayIdx + 1].classList.contains(day)) {
			// When the cell was already rowspan by adding other classes
			element.insertCell(dayIdx + 1).className = `${day + ROWSPAN_IDX_ARR[idx-1][dayIdx]}`
		} else {
			// Otherwise adding new cell
			element.insertCell(dayIdx + 2).className = `${day + ROWSPAN_IDX_ARR[idx-1][dayIdx]}`
		}
	})

	// Colspan the day on <th> inserted new column
	document.querySelector(`#${SCHEDULE_TYPE}-${classType}-${idx} .${day}`).colSpan = `${ROWSPAN_IDX_ARR[idx-1][dayIdx]+1}`

	// Switch the target day
	day = `${day+ROWSPAN_IDX_ARR[idx-1][dayIdx]}`

	// Increase the index of rowspan for that day
	ROWSPAN_IDX_ARR[idx - 1][dayIdx]++

	return day
}

// Remove <td> tags after rowspan the new class for full schedule
function rowspanScheduleDesktop (args) {
	const { position, type, day, begin_hour, begin_min, duration, studio, intval, subSchedule_idx } = args
	// Get the number (Integer) how many rowspan needed after removing any fractional digits
	const rowspan = Math.trunc(duration / intval)

	// When rowspan is needed, if it is bigger than 1 row
	if (rowspan > 1) {
		position.rowSpan = `${rowspan}`;

		// Removes <td>s after rowspan
		let span_num = begin_min,
			extra_Hour = 0,
			i = 0,
			flag = false

		for (i; i < rowspan - 1; i++) {
			span_num += intval
			if (span_num >= 60) {
				extra_Hour++
				span_num = 0
			}

			// For the sub schedules, it may have two schedules on the same page.
			// It should get query with div ids for preventing to rowspan wrong schedule on the other table
			if (SCHEDULE_TYPE == "sub") { // for the schedule of each type
				document.querySelector(`#sub-${type}-${subSchedule_idx} .h_${getHourByTwentyFour(begin_hour + extra_Hour)}.m_${getString00(span_num)}>.${day}`).remove()
			} else if (SCHEDULE_TYPE == "full") { // for the full schedule
				document.querySelector(`.h_${getHourByTwentyFour(begin_hour + extra_Hour)}.m_${getString00(span_num)}>.${day}.studio${studio}`).remove()
			}
		}
	}

}

function convertScheduleInfo (info) {
	return {
		type: info.type.replace(" ", "").toLowerCase(),
		level: info.level.replace(" ", "").toLowerCase(),
		beginHour: getHourByTwentyFour(parseInt(info.hour), info.ampm),
		beginMin: (SCHEDULE_TYPE == 'full') ? parseInt(info.min) : getRoundedMin(parseInt(info.min), INTVAL_SUB),
		endTime: getClassEndsTime(info.hour, info.min, info.ampm, info.duration),
		day: info.day,
		dayIdx: DAYS_ARR.indexOf(info.day)
	}
}

// Adds a class on the full schedule
function addFullScheduleClass(info) {
	const c = convertScheduleInfo(info)

	// Select the position in schedule will be added
	const positionNewClass = document.querySelector(
		`.h_${c.beginHour}.m_${getString00(c.beginMin)}>.${info.day}.studio${info.studio}`
	)

	// Template HTML for full schedule
	const template =
		`<div class="level-label ${c.type}-class"></div>
		<p class="className-label"><b>${info.name}</b><br>
			${getHourByTwelve(c.beginHour)}:${getString00(c.beginMin)}-${getHourByTwelve(c.endTime.hour)}:${getString00(c.endTime.min)}
      		<br> ${getDisplayLabelAndStudio(info.level)}
		</p>`


	// Adds the template for new class
	positionNewClass.innerHTML = template;

	// Rowspan after adding new class, only if duration is bigger than each minutes of row
	(parseInt(info.duration) > INTVAL_FULL) && rowspanScheduleDesktop({
		position: positionNewClass,
		type: c.type,
		day: info.day,
		begin_hour: c.beginHour,
		begin_min: c.beginMin,
		duration: info.duration,
		studio: info.studio,
		intval: INTVAL_FULL,
		subSchedule_idx: null
	})

	// Remove border-day class, if the position contains it
	positionNewClass.classList.contains("border-day") && positionNewClass.classList.remove("border-day")

	// Add classes for adding class
	positionNewClass.classList.add("onClass", `${c.level}-class`, "class-border")
	

	// Also add class into sub schedule for mobile environment
	applyScheduleMobile({
		name: info.name,
		type: c.type,
		level: info.level,
		day: info.day,
		dayIdx: c.dayIdx,
		begin_hour: c.beginHour,
		begin_min: c.beginMin,
		begin_ampm: info.ampm,
		ends: c.endTime,
		idx: null,
		studio: info.studio
	})
}

// Adds a class on the sub schedule for each types in desktop environment
function addSubScheduleClass(info, idx) {
	const c = convertScheduleInfo(info)
	let extraCol_idx = 0

	// Select the position where the new class will be addexport default ;
	let positionNewClass = document.querySelector(
		`#${SCHEDULE_TYPE}-${c.type}-${idx} .h_${c.beginHour}.m_${getString00(c.beginMin)}>.${info.day}`
	)

	// If cell is not existing or empty
	if (checkCellSpace(idx, c.day, c.dayIdx, c.beginHour, c.beginMin, info.duration, c.type, extraCol_idx)) {
		let positionConflict = true // Flag for detecting other columns' availabilities

		// Check the availabilities within other columns if there are multiple columns for that day
		if (ROWSPAN_IDX_ARR[idx - 1][c.dayIdx] > 1) {
			extraCol_idx++

			// Iterate through all the other columns in same day
			while (extraCol_idx <= ROWSPAN_IDX_ARR[idx - 1][c.dayIdx]) {
				positionConflict = checkCellSpace(idx, c.day, c.dayIdx, c.beginHour, c.beginMin, info.duration, c.type, extraCol_idx);

				if (positionConflict === false) {
					break
				} else {
					extraCol_idx++
				}
			}
		}

		// If there is no space in  either spaces
		if (positionConflict === true) {
			// Create extra column for conflicted classes and returned new column's classname as c_Day
			c.day = createExtraColumn({
				day: info.day,
				dayIdx: info.dayIdx,
				begin_hour: c.beginHour,
				begin_min: c.beginMin,
				classType: c.type,
				idx: idx
			})
		} else {
			// Or create in other column already existed, instead of creating new column
			c.day = `${day+ROWSPAN_IDX_ARR[idx-1][extraCol_idx]}`
		}
		
		// Select new position which new inserted column on that day
		positionNewClass = document.querySelector(
			`#${SCHEDULE_TYPE}-${c.type}-${idx} .h_${c.beginHour}.m_${getString00(c.beginMin)}>.${c.day}`
		);

	}

	// Template HTML for sub schedule on desktop or tablet environment
	const template =
		`<p class="className-label"><strong>${info.name}</strong><br>
		${getHourByTwelve(c.beginHour)}:${getString00(parseInt(info.min))}-${getHourByTwelve(c.endTime.hour)}:${getString00(c.endTime.min)}<br>
		${getDisplayLabelAndStudio(info.level, info.studio)}</p>`;

	// Adds the template for new class
	positionNewClass.innerHTML = template;

	// Rowspan after adding new class, only if duration is bigger than each minutes of row
	(parseInt(info.duration) > INTVAL_SUB) && rowspanScheduleDesktop({	
		position: positionNewClass,
		type: c.type,
		day: c.day,
		begin_hour: c.beginHour,
		begin_min: c.beginMin,
		duration: info.duration,
		studio: info.studio,
		intval: INTVAL_SUB,
		subSchedule_idx: idx
	})

	// Warning: Do not switch the class sequence (show/hide function for class type and level may affect)
	positionNewClass.classList.add("onClass", "class-border", `${c.level}-class`)

	// Also add class into sub schedule for mobile environment
	applyScheduleMobile({
		name: info.name,
		type: c.type,
		level: info.level,
		day: info.day,
		dayIdx: c.dayIdx,
		begin_hour: c.beginHour,
		begin_min: c.beginMin,
		begin_ampm: info.ampm,
		ends: c.endTime,
		scheduleIdx: idx,
		studio: info.studio
	})
}

// Adds a class on the sub schedule for each types in mobile environment
function applyScheduleMobile (args) {
	const { name, type, level, day, dayIdx, begin_hour, begin_min, begin_ampm, ends, scheduleIdx, studio } = args

	const id = (!scheduleIdx) ? 'student-schedule-mobile-body' : `schedule-${type}${scheduleIdx}-mobile-body`
	const container = document.getElementById(id)

	// Get index which class has been sorted based on the day and hour
	let insertingIdx = getSortedIndex(id, type, dayIdx, begin_hour, scheduleIdx)

	// Insert new row for inserting class
	const newClass = container.insertRow(insertingIdx)
	newClass.className = `${day} h_${begin_hour} m_${begin_min}`

	// Add day in first column
	const dayCol = newClass.insertCell(0)
	dayCol.innerHTML = day
	dayCol.className = 'mobile_day'

	// Add time in second column
	const timeCol = newClass.insertCell(1)
	timeCol.innerHTML = `${getHourByTwelve(begin_hour)}:${getString00(begin_min)} ${begin_ampm}-${ends.hour}:${getString00(ends.min)} ${ends.ampm}`
	timeCol.className = 'mobile_time'

	// Add name and level in third column
	const classNameCol = newClass.insertCell(2)
	classNameCol.innerHTML = `<strong>${name}</strong><br>${getDisplayLabelAndStudio(level, studio)}`
	classNameCol.className = `${level.replace(" ", "").toLowerCase()}-class`
}

// Get index which the sorted location for inserting class in sub schedule in mobile
function getSortedIndex (selector, type, dayIdx, hour, idx) {
	const rows = document.querySelectorAll(`#${selector} > tr`)
	let result = 0

	// Sorting class by day and time through existing <tr>s
	rows.forEach(element => {
		// Day index of comparison
		const dayIdxComparing = DAYS_ARR.indexOf(element.classList[0]);

		if (dayIdxComparing < dayIdx) {
			result = element.rowIndex;
		} else if (dayIdxComparing === dayIdx) {
			(element.classList[1].split("_")[1] <= hour) && (result = element.rowIndex)
		}
	})
	return result
}

// Rowspan the column of same day in mobile sub schedule
function rowspanScheduleMobile (selector) {
	const rows = document.querySelectorAll(selector)

	// Through all day
	DAYS_ARR.forEach(element => {
    const daySelected = document.querySelectorAll(`${selector}.${element}`)
		const dayIdx = daySelected.length

		// If any schedule on the day
		if (dayIdx > 0) {

			// If only one schedule on this day
			if ((dayIdx === 1) && (daySelected[0].rowIndex !== rows.length)) {
				daySelected[0].classList.add('day-border-bottom')
			} else if (dayIdx > 1) {
				// If more than one schedule on this day
				let i = 0
				for (i; i < dayIdx; i++) {
					if (i === 0) { // Rowspan first element
						daySelected[i].firstChild.rowSpan = dayIdx.toString()
					} else { // Remove all element after rowspan
						daySelected[i].firstChild.remove()

						// When last class of this day and also not the last class of whole class
						if ((i === (dayIdx - 1)) && (daySelected[i].rowIndex !== rows.length)) {
							daySelected[i].classList.add('day-border-bottom')
						}
					}
				}
			}
		}
	})
}

// Extracts the time of begin and end from user input
function getClassEndsTime (hour, min, ampm, duration) {
	hour = parseInt(hour)
	min = parseInt(min)
	duration = parseInt(duration)

	let end_hour, end_min, count = 0

	// Extract hours from duration mins
	while (min + duration >= 60) {
		count++
		duration -= 60
	}

	end_hour = hour + count
	end_min = min + duration

	// Switch AM/PM based on end hour
	if (hour < 12 && end_hour >= 12 && ampm === "AM") {
		ampm = "PM"
	} else if (hour < 12 && end_hour >= 12 && ampm === "PM") {
		ampm = "AM"
	}

	//Return an object
	return {
		hour: end_hour,
		min: end_min,
		ampm
	};
}

// Get rounded minutes based on the interval minutes
function getRoundedMin (min, intval) {
	return (min % intval !== 0) ? min -= (min % intval) : min
}

// Get minutes interval within an hour
function getMinutesByIntval (gap) {
	return 60 / gap
}

// Get time format string: hh:mm:ampm
function getTimeFormat (hour, min, Ms) {
	return `${hour}:${min} ${Ms}`
}

// Get the number of table rows by time gap
function getRowNumberByIntval (timeGap) {
	return ((12 - BEGIN_HOUR) + END_HOUR) * (60 / timeGap)
}

/*
 * Helper Function
 * */


// Helper: convert class level and studio for displaying
function getDisplayLabelAndStudio (className, studioNum) {
	if (!studioNum) {
		return (className === 'Normal') ? '' : `(${className})`
	} else {
		if (className === 'Normal') {
			return `(Studio ${studioNum})`
		}else {
			return `(${className}, Studio ${studioNum})`
		}
	}
}

// Helper: Convert hour from 24 to 12 hour based
function getHourByTwelve (hour) {
	return (hour > 12) ? hour % 12 : hour
}

// Helper: Convert hour from 12 to 24 hour based
function getHourByTwentyFour (hour, ampm) {
	return (ampm == "PM" && hour < 12) ? (hour + 12) % 24 : hour
}

// Helper: Translates single digit to mins
function convertMinutesToString (index, gap) {
	const interval = getMinutesByIntval(gap)
	const calculatedMins = 60 - gap * (interval - index % interval)
	return (calculatedMins === 0) ? "00" : calculatedMins.toString()
}

// Helper: Returns obj which contains the increased time
function getIncreasedTime (obj, gap) {
	obj.min += gap;

	if (obj.hour === 11 && obj.min === 60) { // Switch to PM from 12
		obj.ampm = "PM"
		obj.hour++
		obj.min = 0
	} else if (obj.hour === 12 && obj.min === 60) { // 12 hour mode
		obj.hour = 1
		obj.min = 0
	} else if (obj.min === 60) {
		obj.hour++
		obj.min = 0
	}
	return obj
}

// Helper: Returns increased hour and min for adding class based on the 24 hours timeline
function getNextTimeByIntval (hour, min, intvalType) {
	// Set intval based on the schedule type
	const intval = (intvalType === "full") ? INTVAL_FULL : INTVAL_SUB
	min += intval

	// When minutes reach to the 60 mins, convert it
	if (min === 60) { 
		hour++
		(hour === 24) && (hour = 0)
		min = 0
	}

	return {
		hour: hour,
		min: min
	}
}

// Helper: Translate double zero when num is 0
function getString00 (num) {
	return (num === 0) ? "00" : num
}

// Helper: Check whether the Sub type of class is existing in list of class type from db
function isValidSubType () {
	return TYPE_ARR.includes(SUB_TYPE)
}

/*
 * RESTful API
 * */

// Async function: Get JSON data from server
function getDataFromServer (url, callback, idx) {
	// Promise: will resolve after retrieving data from DB
	new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest()
		xhr.onreadystatechange = () => (xhr.readyState === 4 && xhr.status === 200) && resolve(xhr.responseText)
		xhr.open('GET', url, true)
		xhr.send()
	}).then((data) => {
		callback(data, idx)
	}).catch((err) => {
		// alert(`Sorry, the schedule is temporarily undergoing maintenance. We apologize for the inconvenience.`);
		console.error(err)
	})


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

function rowspanHandler (idx) {
	if (SCHEDULE_TYPE != "full") {
    // Rowspan days column in sub schedule for mobile environment
    const table = `#schedule-${SUB_TYPE.toLowerCase()}${idx}-mobile-body > tr`
		rowspanScheduleMobile(table)
	} else {
    const table = `#student-schedule-mobile-body > tr`
		rowspanScheduleMobile(table)
	}
}

// Apply class info by retrieved data from DB
function applyClassInfo (json, idx) {
	const data = JSON.parse(json)
	const classNum = Object.keys(data).length

	new Promise((resolve, reject) => {
		Object.keys(data).forEach((_class, index) => {
			// Add each class depends on the schedule type
			(SCHEDULE_TYPE == "full") ? addFullScheduleClass(data[_class]) : addSubScheduleClass(data[_class], idx);

			// Resolve the promise, if all the class has been added
			(index === classNum - 1) && resolve();
		})
		rowspanHandler(idx)

	}).then(() => {
		labelHandler() // Set label colors after create all the class schedule
	}).catch((err) => {
		// alert(`Sorry, the schedule is temporarily undergoing maintenance. We apologize for the inconvenience.`);
		console.error(err)
	})

}

// Apply setting info by retrieved data from DB
function applySetting (settingData) {
	settingData = JSON.parse(settingData) // Parse json from AJAX call

	// Set Global variables based on the setting retrieved from server in object
	DAYS_ARR = settingData.day.split(",")
	NUM_DAYS = DAYS_ARR.length

	STUDIO_ARR = settingData.studio.split(",")
	NUM_STUDIO = STUDIO_ARR.length

	TYPE_ARR = settingData["type"].split(",")
	TYPE_LABEL = settingData["label"]["type"].split(",")

	LEVEL_ARR = settingData["level"].split(",")
	LEVEL_LABEL = settingData["label"]["level"].split(",")

	// Set Global variables for the show/hide DOM event
	ALL_TYPE_LEVEL = LEVEL_ARR.concat(TYPE_ARR)
	
	// Replace to lowercase and non space
	ALL_TYPE_LEVEL = ALL_TYPE_LEVEL.map(element => element.replace(" ", "").toLowerCase())

	SCHEDULE_NAME = settingData.naming
	SCHEDULE_NOTICE = settingData.notice

	// Array for storing whether show/hide function activated
	ACTIVE_FLAG_SHOWHIDE = new Array(TYPE_ARR.length + LEVEL_ARR.length).fill(false)



	if (SCHEDULE_TYPE == "full") {
		// Create a full schedule of classes
		generateFullScheduleTemplate()

		// Set announcement bar for the full schedule
		noticeHandler(settingData.notice[`schedule${SCHEDULE_NUM}`])

	} else if (SCHEDULE_TYPE == "sub") {
		// Check whether class type is legal
		// The reason why SUB_TYPE var checks at here is that
		// the variable needs to compared after data retrieved from server
		isValidSubType() ? generateSubScheduleTemplate(SUB_TYPE) : console.error(`Error: ${SUB_TYPE} is not existing in the list of our class types`)
	}
}

/**
 * Filtering following class level or type
 */

// Called with EventListener which handling class filter on the full student schedule
function opacityHandler (event) {
	// Verify the input type or level by contained className
	const target = event.target
	const targetClassList = event.target.classList[0]
	let targetClassIdx

	// When user click class type label area
	if (targetClassList === 'className-label' || target.localName === 'b') {
		// It may clicked with <b> tag on the className-label <p>, thus it needs to set one more step above by parentNode
		// It cannot be used by event.path or event.srcElement. These are not standard. Only for Chrome browser
		let selectedClassType
		(target.localName === "b") ? selectedClassType = target.parentNode.parentNode.classList: selectedClassType = target.parentNode.classList;

		// Needs to be considered, if the class begin at 45 mins and it has one more class than other class: "border-hour"
		(selectedClassType.contains("border-hour")) ? targetClassIdx = 4: targetClassIdx = 3;

		const solidClass = document.querySelectorAll(`.onClass.${selectedClassType[targetClassIdx]} > .level-label`)
		const blurClass = document.querySelectorAll(`.onClass:not(.${selectedClassType[targetClassIdx]}) > .level-label`)
		setOpacitytoBlur(selectedClassType[targetClassIdx], solidClass, blurClass)

	// When user click level label area
	} else if (targetClassList === 'level-label') {
		const selected_class_level = target.classList[1]
		const solidClass = document.querySelectorAll(`.level-label.${selected_class_level}`)
		const blurClass = document.querySelectorAll(`.level-label:not(.${selected_class_level})`)
		setOpacitytoBlur(selected_class_level, solidClass, blurClass)
	}
}

// Set opacity of class schedule based on the user click by EventListener
function setOpacitytoBlur (targetClass, selected, notSelected) {
	// Remove '-class'
	const idx = ALL_TYPE_LEVEL.indexOf(targetClass.replace("-class", ""))

	if ((ACTIVE_FLAG_SHOWHIDE[idx] !== true && PREV_SELECTED === undefined) ||
		ACTIVE_FLAG_SHOWHIDE[idx] !== true && PREV_SELECTED === targetClass) {
		// When label selected first time or again
		notSelected.forEach(tag => tag.parentNode.style.opacity = 0.2)

		// Active Flag: whether specific class has been selected or not
		ACTIVE_FLAG_SHOWHIDE[idx] = true

		// Store selected class type or level
		PREV_SELECTED = targetClass
		PREV_SELECTED_IDX = idx

	} else if (ACTIVE_FLAG_SHOWHIDE[idx] !== true && PREV_SELECTED !== targetClass) {
		// When label selected after different label has been selected
		notSelected.forEach(tag => tag.parentNode.style.opacity = 0.2)

		selected.forEach(tag => tag.parentNode.style.opacity = 1)

		// Activated new class and deactivated prev class
		ACTIVE_FLAG_SHOWHIDE[idx] = true
		ACTIVE_FLAG_SHOWHIDE[PREV_SELECTED_IDX] = false

		// Store selected class type or level
		PREV_SELECTED = targetClass
		PREV_SELECTED_IDX = idx

	} else {
		// Store opacity
		notSelected.forEach((tag) => tag.parentNode.style.opacity = 1)
		ACTIVE_FLAG_SHOWHIDE[PREV_SELECTED_IDX] = false
	}
}

// Filtering class and fixed timeline and header tables event handler
function eventHandler () {
	// EventListener to handle clicking classes for filtering results
	document.addEventListener('click', (event) => opacityHandler(event), false)

	window.onscroll = (e) => {
		// The value of height for top margin of class schedule (#right-schedule)
		const fixed_MarginTop = document.querySelector("#top-tbl").firstChild.clientHeight

		const body1 = document.body // body tag selector, for Chrome, Safari and Opera		
		const body2 = document.documentElement // body tag selector, for Firefox and IE places the overflow at the <html> level
		const timeLine = document.getElementById("left-timeLine") // timeline table selector
		const headerTable = document.getElementById("header-days") // header days table selector


		if (body2.scrollTop === 0 && body2.scrollLeft === 0) {
			// For Chrome, Safari and Opera		
			if (body1.scrollTop > -1) {
				timeLine.style.top = `${-body1.scrollTop + fixed_MarginTop - 3}px`
			}

			if (body1.scrollLeft > -1) {
				headerTable.style.left = `${-body1.scrollLeft}px`
			}
		} else if (body1.scrollTop === 0 && body1.scrollLeft === 0) {
			// Firefox and IE places the overflow at the <html> level
			if (body2.scrollTop > -1) {
				timeLine.style.top = `${-body2.scrollTop + fixed_MarginTop - 4}px`
			}
			if (body2.scrollLeft > -1) {
				headerTable.style.left = `${-body2.scrollLeft}px`
			}
		}
	}

}