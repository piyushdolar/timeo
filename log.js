// File system
const fs = require('fs')

// OS
const { homedir } = require('os')

// Package file
const packageJson = require('./package.json')

// Moment JS
const moment = require('moment')
const date = moment().format('DDMMYYYY')

// Path
const path = require('path')

// Class
class Log {
	#dir = homedir + '/timeo'
	#filename

	constructor() {
		const $this = this
		$this.#filename = $this.#dir + '/' + date + '.log'

		// Create directory
		if (!fs.existsSync($this.#dir)) {
			fs.mkdir($this.#dir, { recursive: true }, (err) => {
				if (err) console.error('Can not create the folder for storing logs');
			});
		}
		// Create file
		this.write('App opened', moment())
	}

	async config(config) {
		const file = `${this.#dir}/config.json`
		try {
			let fileData = {};

			// Check file exist
			const fileExists = await fs.promises.access(file)
				.then(() => true)
				.catch(() => false);

			// Create file if not exist
			if (!fileExists) {
				await fs.promises.writeFile(file, JSON.stringify(fileData, null, 2), 'utf-8');
			}

			// Read the existing JSON data from the file
			const existingData = await fs.promises.readFile(file, 'utf-8');
			if (existingData) {
				fileData = JSON.parse(existingData);
			}

			// Update fileData with the new config
			if (config && config.name && config.value) {
				fileData[config.name] = config.value;
			}

			// Write the updated data back to the file
			await fs.promises.writeFile(file, JSON.stringify(fileData, null, 2), 'utf-8');

			return fileData;
		} catch (error) {
			console.error('Error:', error);
			return {};
		}
	}

	read(date) {
		return new Promise((resolve, reject) => {
			try {
				const fileName = date ? path.join(this.#dir, `${date}.log`) : this.#filename
				fs.readFile(fileName, (err, data) => {
					if (err) this.write('Log file generated', moment())
					resolve(JSON.parse(data))
				})
			} catch (error) {
				reject('Can not read file', error)
			}
		}).then(resolved => resolved).catch(error => console.error('log.js:', error))
	}

	history(fileDate) {
		return new Promise((resolve, reject) => {
			try {
				fs.readdir(this.#dir, async (err, files) => {
					if (err) console.error('ERR', err)

					let fileDates = []
					let fileContent = []

					files.forEach(async file => {
						if (path.extname(file).toLowerCase() === '.log') {
							const parsed = path.parse(file)
							fileDates.push(parsed)
							if (parsed.name === fileDate) {
								const filePath = path.join(this.#dir, file);
								fileContent = JSON.parse(fs.readFileSync(filePath))
							}
						}
					})

					resolve({
						dates: fileDates,
						fileContent: fileContent
					})
				});
			} catch (error) {
				reject('Can not read file', error)
			}
		}).then(resolved => resolved).catch(error => console.error('log.js:history:', error))
	}

	writeIn(data) {
		fs.writeFile(this.#filename, JSON.stringify(data), (err) => {
			if (err) {
				console.error('Can not write in the file')
			}
		})
	}

	async write(eventType, eventTime) {
		let object = {
			eventType,
			eventTime
		}
		const $this = this
		let array = []

		await fs.readFile($this.#filename, async function (err, data) {
			// file exist
			if (!err && data) {
				let fileData = await JSON.parse(data)
				await fileData.push(object)
				$this.writeIn(fileData)
			} else {
				// file not exist
				await array.push(object)
				$this.writeIn(array)
			}
		});
		return object
	}

	format(eventType, eventTime) {
		return [{
			eventType,
			eventTime
		}]
	}
}

// Export
module.exports = { Log }