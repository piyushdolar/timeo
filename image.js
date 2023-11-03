const fs = require('fs');
const https = require('https');
const path = require('path');
const { app } = require('electron');

const destinationDir = app.getPath('userData');
const destinationFilePath = path.join(destinationDir, 'background.jpg');

function getBackgroundImage() {
	return new Promise((resolve, reject) => {
		if (fs.existsSync(destinationFilePath)) {
			resolve(destinationFilePath);
		} else {
			resolve(null); // Background image not found
		}
	});
}

function changeBackgroundImage(event, image) {
	return new Promise((resolve, reject) => {
		try {
			const sourceStream = fs.createReadStream(image);
			const destinationStream = fs.createWriteStream(destinationFilePath);

			sourceStream.on('error', (err) => {
				reject('Error reading the source file: ' + err.message);
			});

			destinationStream.on('error', (err) => {
				reject('Error writing the destination file: ' + err.message);
			});

			destinationStream.on('finish', () => {
				resolve();
				event.reply('image-task-finished', { success: true });
			});

			sourceStream.pipe(destinationStream);
		} catch (error) {
			reject('Error: ' + error.message);
		}
	});
}

function changeBackgroundImageByUrl(event, url) {
	return new Promise((resolve, reject) => {
		https.get(url, (response) => {
			if (response.statusCode === 200) {
				const imageFile = fs.createWriteStream(destinationFilePath);

				response.pipe(imageFile);

				imageFile.on('finish', () => {
					imageFile.close();
					resolve();
					event.reply('image-download-complete', { success: true });
				});

				imageFile.on('error', (error) => {
					reject('Error writing the image file: ' + error.message);
					event.reply('download-error', error.message);
				});
			} else {
				reject('HTTP status code: ' + response.statusCode);
				event.reply('download-error', 'HTTP status code: ' + response.statusCode);
			}
		}).on('error', (error) => {
			reject('Error downloading image: ' + error.message);
			event.reply('download-error', error.message);
		});
	});
}

function deleteBackgroundImage(event) {
	return new Promise((resolve, reject) => {
		fs.unlink(destinationFilePath, (error) => {
			if (error) {
				reject('Error deleting background image: ' + error.message);
			} else {
				resolve();
				event.reply('image-task-finished', { success: true });
			}
		});
	});
}

module.exports = {
	getBackgroundImage,
	changeBackgroundImage,
	changeBackgroundImageByUrl,
	deleteBackgroundImage,
};
