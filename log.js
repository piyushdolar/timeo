// File system
const fs = require('fs')

// OS
const { homedir } = require('os')

// Moment JS
const moment = require('moment')
const date = moment().format('DDMMYYYY')

// Path
const path = require('path')

// Class
class Log {
	#dir = homedir + '/timeo'
	#file

	constructor() {
		this.#file = this.#dir + '/' + date + '.log'
	}

	// Check if file is exist
	async isFileExist(fileName) {
		const $this = this
		const file = fileName ? path.join(this.#dir, fileName) : this.file
		try {
			return new Promise((resolve) => {
				fs.access(file, fs.constants.R_OK | fs.constants.W_OK, (error) => {
					if (error) {
						resolve(false); // File access is not possible
					} else {
						resolve(true); // File access is possible
					}
				});
			});
		} catch (error) {
			console.error('isFileExist(): ', error)
			return false
		}
	}

	// Write file
	async writeFile(newObject) {
		try {
			// Check if the file exists
			const fileExists = await this.isFileExist()

			if (fileExists) {
				// Read existing content
				const existingContent = await fs.readFile(this.#file, 'utf-8')
				const jsonExistingContent = await JSON.parse(existingContent)
				await jsonExistingContent.push(newObject)
				const updatedContent = await JSON.stringify(jsonExistingContent)

				// Write the updated content back to the file
				await fs.writeFile(this.#file, updatedContent);
			} else {
				const newContent = []
				newContent.push(newObject)
				await JSON.stringify(newContent)

				// Create the file and write initial data
				await fs.writeFile(this.#file, newContent);
			}
			return newObject
		} catch (error) {
			this.error('Error:', error);
		}
	}

	// Read file
	async readFile(date) {
		const $this = this
		try {
			// Check if the file exists
			const fileExists = await $this.isFileExist(date)
			if (fileExists) {
				// Read existing content
				const existingContent = await fs.readFileSync($this.#file, 'utf-8');
				const parsed = await JSON.parse(existingContent)
				return parsed;
			} else {
				// Create the file and write initial data
				const newObject = JSON.stringify({ eventType: 'File created', eventTime: moment() })
				await $this.writeFile(newObject)
				return newObject
			}
		} catch (error) {
			this.error(error);
			return [];
		}
	}

	// Write error log into file
	async error(errorText) {
		let file = `${date}.error.log`

		// Prepare text
		let text = `[${moment().format('hh:mm:ss a')}] ${errorText}\n`

		// Check file exist
		const fileExists = await this.isFileExist(file)
		file = path.join(this.#dir, `${date}.error.log`)
		// Create file if not exist
		if (!fileExists) {
			fs.promises.writeFile(file, text);
		} else {
			// Append to file
			await fs.appendFile(file, text, function (error) {
				if (error) console.error('error(): ', error);
			});
		}
	}

	async config(config) {
		const file = 'config.json'
		const $this = this
		try {
			let fileData = {};

			// Check file exist
			const fileExists = await $this.isFileExist(file)

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
			$this.error(error)
			return {};
		}
	}

	// Find and get data from the file
	async history(date) {
		const $this = this
		const data = await new Promise((resolve, reject) => {
			try {
				resolve($this.readFile(`${date}.log`))
			} catch (error) {
				reject('history(): ', error)
			}
		}).then(resolved => resolved)
			.catch(error => $this.error(error))
		return data
	}

	// Write into file
	async write(eventType, eventTime) {
		let object = {
			eventType,
			eventTime
		}
		const $this = this
		const data = await new Promise((resolve, reject) => {
			try {
				resolve($this.writeFile(object))
			} catch (error) {
				reject('write(): ', error)
			}
		}).then(resolved => resolved)
			.catch(error => $this.error(error))
		return data
	}
}

// Export
module.exports = { Log }