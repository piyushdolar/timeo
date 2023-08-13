// File system
const fs = require('fs')

// OS
const { homedir } = require('os')

// Package file
const packageJson = require('./package.json')

// Moment JS
const moment = require('moment')
const date = moment().format('DDMMYYYY')

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

	read() {
		return new Promise((resolve, reject) => {
			try {
				fs.readFile(this.#filename, (err, data) => {
					if (err) console.error('Can not read the file')
					// console.log("log.js in", JSON.parse(data))
					resolve(JSON.parse(data))
				})
			} catch (error) {
				reject('Can not read file', error)
			}
		}).then(resolved => resolved).catch(error => console.error('log.js:', error))
	}

	async writeIn(data) {
		return await new Promise((resolve, reject) => {
			try {
				resolve(fs.writeFile(this.#filename, JSON.stringify(data), (err) => {
					if (err) {
						console.error('Can not write in the file')
					}
				}))
			} catch (e) {
				reject(false)
			}

		}).then(v => true).catch(e => false)
	}

	async write(eventType, eventTime) {
		let object = {
			eventType,
			eventTime
		}
		const $this = this
		let array = []

		return await fs.readFile($this.#filename, async function (err, data) {
			// file exist
			if (!err && data) {
				let fileData = await JSON.parse(data)
				await fileData.push(object)
				return await $this.writeIn(fileData)
			} else {
				// file not exist
				await array.push(object)
				return await $this.writeIn(array)
			}
		});
	}
}

// Export
module.exports = { Log }