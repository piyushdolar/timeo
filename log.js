// File system
const fs = require('fs')

// Moment JS
const moment = require('moment')
const date = moment().format('DDMMYYYY')

// Path
// MAC LOGs: /Users/<mac-username>/Library/Logs/timeo
// MAC Settings: /Users/piyushdolar/Library/Application Support/timeo
// Windows Logs: %APPDATA%/timeo
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

		this.create('Welcome')
	}

	async _handleError(context, error) {
		console.error(`${context}: ${error.message}`);
		$this.error(`${context}: ${error.message}`)
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
			await this._handleError('isFileExist()', error);
			return false
		}
	}

	// Check file
	async checkFile(filename) {
		const $this = this
		try {
			return new Promise((resolve, reject) => {
				fs.readFile(filename, 'utf-8', (error, data) => {
					if (error) {
						reject(error)
					} else {
						resolve(data)
					}
				});
			}).then(data => data)
		} catch (error) {
			await this._handleError('checkFile()', error);
			return false
		}
	}

	// Write file
	async writeFile(filename, content) {
		const $this = this
		try {
			return new Promise((resolve, reject) => {
				fs.writeFile(filename, content, (error) => {
					if (error) {
						reject(error)
						$this.error(`writeFile(): ${error}`)
					} else {
						resolve(content)
					}
				});
			}).then(data => data)
		} catch (error) {
			await this._handleError('writeFile()', error);
			return false
		}
	}

	// Create log function
	async create(event) {
		try {
			const $this = this
			let object = {
				eventType: event,
				eventTime: moment()
			}
			const fileExists = await this.isFileExist()
			if (fileExists) {
				// Read existing content
				const content = await $this.checkFile($this.#file)
				const contentParsed = await JSON.parse(content)
				await contentParsed.push(object)
				const updatedContent = await JSON.stringify(contentParsed)

				// Write the updated content back to the file
				await $this.writeFile($this.#file, updatedContent)
				return object
			} else {
				const newContent = []
				newContent.push(object)
				const stringify = await JSON.stringify(newContent)

				// Create the file and write initial data
				return await $this.writeFile($this.#file, stringify)
			}
		} catch (error) {
			await this._handleError('create()', error);
		}
	}


	// Find and get data from the file
	async history(date) { // date - DDMMYYYY(format)
		const $this = this
		try {
			// Check if the file exists
			let file = $this.#file
			if (date) file = path.join(this.#dir, `${date}.log`)
			const fileExists = await $this.isFileExist(file)
			if (fileExists) {
				// Read existing content
				const existingContent = await $this.checkFile(file);
				return existingContent; // don't parse ipc need strings
			} else {
				return JSON.stringify([])
			}
		} catch (error) {
			await this._handleError('history()', error);
			return defaultArray;
		}
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
				const existingData = await $this.checkFile($this.#configFile);
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
			await this._handleError('config()', error);
			return {};
		}
	}

	// Write error log into file
	async error(errorText) {
		try {
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
		} catch (error) {
			await this._handleError('error()', error);
		}
	}
}

// Export
module.exports = { Log }