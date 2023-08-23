// File system
const fs = require('fs')

// Moment JS
const moment = require('moment')
const date = moment().format('DDMMYYYY')

// Path
const path = require('path')

// Class
class Log {
	#dir
	#file
	#configFile

	constructor(path) {
		this.#dir = path
		this.#file = this.#dir + '/' + date + '.log'
		this.#configFile = this.#dir + '/config.json'

		this.createFiles()
	}

	// Create default files
	createFiles() {
		const $this = this
		if (!fs.existsSync($this.#file)) {
			const data = [{ eventType: 'File created', eventTime: moment() }]
			fs.writeFileSync($this.#file, JSON.stringify(data));
		}
	}

	// Check if file is exist
	async isFileExist(file) {
		const $this = this
		const checkFile = file ? file : $this.#file
		try {
			return new Promise((resolve) => {
				fs.access(checkFile, fs.constants.R_OK | fs.constants.W_OK, (error) => {
					if (error) {
						resolve(false); // File access is not possible
					} else {
						resolve(true); // File access is possible
					}
				});
			});
		} catch (error) {
			console.error('isFileExist(): ', error.message)
			return false
		}
	}

	// Write file
	async writeFile(newObject) {
		const $this = this
		try {
			// Check if the file exists
			const fileExists = await this.isFileExist()
			if (fileExists) {
				// Read existing content
				const content = await fs.readFileSync($this.#file, 'utf-8')
				const contentParsed = await JSON.parse(content)
				await contentParsed.push(newObject)
				const updatedContent = await JSON.stringify(contentParsed)

				// Write the updated content back to the file
				await fs.writeFileSync($this.#file, updatedContent);
			} else {
				const newContent = []
				newContent.push(newObject)
				const stringify = await JSON.stringify(newContent)

				// Create the file and write initial data
				await fs.writeFileSync($this.#file, stringify);
			}
			return newObject
		} catch (error) {
			console.error('writeFile(): ', error)
			this.error('writeFile(): ', error.message);
		}
	}

	// Write into file
	async write(event) {
		let object = {
			eventType: event,
			eventTime: moment()
		}
		const $this = this
		const data = await new Promise((resolve, reject) => {
			try {
				resolve($this.writeFile(object))
			} catch (error) {
				reject('write(): ', error)
			}
		}).then(resolved => resolved)
			.catch(error => {
				console.error('write(): ', error.message)
				$this.error(error.message)
			})
		return data
	}

	// Read file
	async readFile(date) {
		const $this = this
		// let defaultArray = []
		try {
			// Check if the file exists
			let file = $this.#file
			if (date) file = path.join(this.#dir, date)
			const fileExists = await $this.isFileExist(file)
			if (fileExists) {
				// Read existing content
				const existingContent = await fs.readFileSync(file, 'utf-8');
				return existingContent; // don't parse ipc need strings
			} else {
				return JSON.stringify([])
			}
		} catch (error) {
			console.error(error)
			this.error(`readFile(): ${error.message}`);
			return defaultArray;
		}
	}

	// Find and get data from the file
	async history(date) { // date - DDMMYYYY(format)
		const $this = this
		const data = await new Promise((resolve, reject) => {
			try {
				resolve($this.readFile(`${date}.log`))
			} catch (error) {
				reject('history(): ', error)
			}
		}).then(resolved => resolved)
			.catch(error => {
				console.error('history(): ', error.message)
				$this.error(error.message)
			})
		return data
	}

	async config(config) {
		const $this = this
		try {
			let fileData = {};

			// Check file exist
			const fileExists = await $this.isFileExist($this.#configFile)

			// Create file if not exist
			if (!fileExists) {
				await fs.promises.writeFile($this.#configFile, JSON.stringify(fileData, null, 2), 'utf-8');
			} else {
				// Read the existing JSON data from the file
				const existingData = await fs.promises.readFile($this.#configFile, 'utf-8');
				if (existingData) {
					fileData = JSON.parse(existingData);
				}
				// Update fileData with the new config
				if (config && config.name && config.value) {
					fileData[config.name] = config.value;
					// Write the updated data back to the file
					await fs.promises.writeFile($this.#configFile, JSON.stringify(fileData, null, 2), 'utf-8');
				}
			}
			return fileData;
		} catch (error) {
			console.error('config(): ', error.message)
			$this.error(error.message)
			return {};
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
}

// Export
module.exports = { Log }