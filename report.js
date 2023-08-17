// Formate date
function formatDate(date) {
	return moment(date, 'DDMMYYYY').format('D/MM/Y');
}

// Select box
const selectDate = document.getElementById('select-date')
function updateSelect(option) {
	const newOption = document.createElement("option");
	newOption.value = option;
	newOption.text = formatDate(option)
	selectDate.add(newOption);
}

// Render table
function renderTableData(date, logs) {
	const logTableBody = document.getElementById('log-table-body')
	logTableBody.innerHTML = ''

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

// Get logs
function getLogs(date = moment().format('DDMMYYYY')) {
	new Promise((resolve, reject) => {
		try {
			resolve(preload.history(date))
		} catch (error) {
			reject(error)
		}
	}).then(logs => {
		logs.dates.reverse()
		if (logs.dates.length === selectDate.options.length) {
			for (let i = 0; i < selectDate.options.length; i++) {
				if (selectDate.options[i].value === date) {
					selectDate.options[i].selected = true
					break;
				}
			}
		} else {
			logs.dates.forEach(function (element) {
				updateSelect(element.name)
			})
		}
		renderTableData(date, logs.fileContent)
	}).catch(error => console.warn('Loading logs has some error', error))
}


// On Change: Select box
selectDate.addEventListener("change", function () {
	getLogs(selectDate.value)
});


// On page load
getLogs()