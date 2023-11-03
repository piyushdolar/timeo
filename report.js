// Format Date
function formatDate(date) {
	return moment(date, 'DDMMYYYY').format('D/MM/Y');
}

// --------------------------------------------
// Select box
// --------------------------------------------
const dateSelectYear = document.getElementById('date-select-year')
const dateSelectMonth = document.getElementById('date-select-month')
const dateSelectDay = document.getElementById('date-select-day')

// Year: Update list
const years = (back = 4) => {
	const year = new Date().getFullYear();
	return Array.from({ length: back }, (v, i) => year - back + i + 1).reverse();
}
for (let i = 0; i < years().length; i++) {
	let opt = years()[i];
	let el = document.createElement("option");
	el.textContent = opt;
	el.value = opt;
	el.selected = opt === moment().year() ? true : false;
	dateSelectYear.appendChild(el);
}
// Month: Update list
for (let month = 0; month < 12; month++) {
	const monthNumber = month + 1;
	const formattedMonthNumber = String(monthNumber).padStart(2, '0');
	let el = document.createElement("option");
	el.textContent = monthNumber;
	el.value = formattedMonthNumber;
	el.selected = monthNumber === (moment().month() + 1) ? true : false;
	dateSelectMonth.appendChild(el);
}
// Day: Update list
function getDatesForMonth(year, month) {
	const startDate = moment({ year, month, day: 1 });
	const endDate = moment(startDate).endOf('month');
	const dates = [];

	while (startDate.isSameOrBefore(endDate, 'day')) {
		dates.push(startDate.format('DD'));
		startDate.add(1, 'day');
	}
	return dates;
}
const datesList = getDatesForMonth(moment().year(), moment().month());
for (let i = 1; i < datesList.length; i++) {
	let el = document.createElement("option");
	const formattedValue = i < 10 ? `0${i}` : i.toString(); // Format with leading zero
	el.textContent = i;
	el.value = formattedValue;
	el.selected = i === moment().date() ? true : false;
	dateSelectDay.appendChild(el);
}

// Listen on date change
dateSelectDay.addEventListener("change", function () {
	getLogs(this.value + dateSelectMonth.value + dateSelectYear.value)
});
dateSelectMonth.addEventListener("change", function () {
	getLogs(dateSelectDay.value + this.value + dateSelectYear.value)
});
dateSelectYear.addEventListener("change", function () {
	getLogs(dateSelectDay.value + dateSelectMonth.value + this.value)
});

// --------------------------------------------
// Render table function
// --------------------------------------------
function renderTableData(date, logs) {
	// Add count
	const logTableHead = document.getElementById('history-count')
	logTableHead.innerText = logs.length

	// Add logs
	const logTableBody = document.getElementById('log-table-body')
	logTableBody.innerHTML = ''

	// If no data
	if (logs.length === 0) {
		let row = document.createElement("tr");
		let cell = document.createElement("td");
		cell.colSpan = 3
		cell.classList.add('text-center', 'text-danger')
		cell.innerText = 'No data available!'
		row.appendChild(cell);
		logTableBody.prepend(row);
	}

	// If has data
	for (var i = 0; i < logs.length; i++) {
		let row = document.createElement("tr");

		// add date
		let cell = document.createElement("td");
		cell.innerHTML = formatDate(date)
		row.appendChild(cell)

		// add log values
		for (let j = 0; j < Object.keys(logs[i]).length; j++) {
			let cell = document.createElement("td");
			cellValue = logs[i][Object.keys(logs[i])[j]];
			if (Object.keys(logs[i])[j] === 'eventTime') {
				let checkDate = moment(logs[i][Object.keys(logs[i])[j]])
				cellValue = checkDate.isValid() ? moment(logs[i][Object.keys(logs[i])[j]]).format('hh:mm:ss a') : cellValue
			}
			cell.innerHTML = cellValue
			row.appendChild(cell);
		}
		logTableBody.prepend(row);
	}
}

// --------------------------------------------
// Get Logs
// --------------------------------------------
function getLogs(date = moment().format('DDMMYYYY')) {
	new Promise((resolve, reject) => {
		try {
			resolve(preload.history(date))
		} catch (error) {
			reject(error)
		}
	}).then(async stringifyLogs => {
		const logs = JSON.parse(stringifyLogs)
		logs.reverse()
		renderTableData(date, logs)
	}).catch(error => console.warn('Loading logs has some error', error))
}

// First time load logs
getLogs()