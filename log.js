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

	error(errorText) {
		const file = `${this.#dir}/${date}.error.log`

		// Check file exist
		const fileExists = fs.promises.access(file)
			.then(() => true)
			.catch(() => false);

		// Create file if not exist
		if (!fileExists) {
			fs.promises.writeFile(file, 'File created');
		} else {
			// Append to file
			fs.appendFileSync(file, errorText, function (err) {
				if (err) console.error(err);
			});
		}
	}

	async config(config) {
		const file = `${this.#dir}/config.json`
		const $this = this
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
			$this.error(`[${moment().format('hh:mm:ss a')}] ${error}`)
			return {};
		}
	}

	read(date) {
		const $this = this
		return new Promise((resolve, reject) => {
			try {
				const fileName = date ? path.join(this.#dir, `${date}.log`) : this.#filename
				fs.readFile(fileName, (err, data) => {
					if (err) {
						this.write('Log file generated', moment())
						resolve([])
					} else {
						resolve(JSON.parse(data))
					}
				})
			} catch (error) {
				reject('Can not read file', error)
			}
		}).then(resolved => resolved)
			.catch(error => $this.error(`[${moment().format('hh:mm:ss a')}] ${error}`))
	}

	history(fileDate) {
		const $this = this
		return new Promise((resolve, reject) => {
			try {
				const filePath = path.join(this.#dir, `${fileDate}.log`);
				fs.readFile(filePath, (err, data) => {
					if (err) {
						resolve([])
					} else {
						resolve(JSON.parse(data))
					}
				})
			} catch (error) {
				reject('Can not read file', error)
			}
		}).then(resolved => resolved)
			.catch(error => $this.error(`[${moment().format('hh:mm:ss a')}] ${error}`))
	}

	writeIn(data) {
		const $this = this

		fs.writeFile(this.#filename, JSON.stringify(data), (err) => {
			if (err) {
				$this.error(`[${moment().format('hh:mm:ss a')}] ${err}`)
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
				$this.error(`[${moment().format('hh:mm:ss a')}] ${err}`)
				await array.push(object)
				$this.writeIn(array)
			}
		});
		return object
	}
}

// Export
module.exports = { Log }