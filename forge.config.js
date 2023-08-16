const config = require("dotenv");
const env = config.config()
module.exports = {
	packagerConfig: {
		asar: true,
		icon: './assets/images/icon'
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {
				// An URL to an ICO file to use as the application icon (displayed in Control Panel > Programs and Features).
				iconUrl: './assets/images/icon.ico',
				// The ICO file to use as the icon for the generated Setup.exe
				setupIcon: './assets/images/icon.ico'
			},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
			config: {
				icon: './assets/images/icon.ico'
			}
		},
		{
			name: '@electron-forge/maker-dmg',
			config: {
				icon: './assets/images/icon.icns',
				background: './assets/images/dmg-background.png',
				format: 'ULFO'
			}
		},
		{
			name: '@electron-forge/maker-deb',
			config: {
				options: {
					icon: './assets/images/icon.png'
				}
			},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {},
		},
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},
	],
	publishers: [
		{
			name: '@electron-forge/publisher-github',
			config: {
				repository: {
					owner: 'piyushdolar',
					name: 'timeo'
				},
				prerelease: false,
				draft: false, // true will create draft release which needs to manually release from github
				authToken: env.GITHUB_TOKEN
			}
		}
	]
};
