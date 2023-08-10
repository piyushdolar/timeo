// const package = require('./package.json')
const config = require("dotenv");
const env = config.config()

module.exports = {
	packagerConfig: {
		asar: true,
		// ------------------------------------------------
		// Keep disable unless untill you wants to sign it.
		// ------------------------------------------------
		/* osxNotarize: {
			tool: 'notarytool',
			appleId: process.env.APPLE_ID,
			appleIdPassword: process.env.APPLE_PASSWORD,
			teamId: process.env.APPLE_TEAM_ID
		 } */
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin'],
		},
		{
			name: '@electron-forge/maker-deb',
			config: {},
		},
		{
			name: '@electron-forge/maker-rpm',
			config: {},
		},
		{
			name: '@electron-forge/maker-dmg',
			config: {
				background: './assets/images/dmg-background.png',
				format: 'ULFO'
			}
		},
		{
			name: '@electron-forge/maker-wix',
			config: {
				language: 1033,
				manufacturer: 'Timeo & co'
			}
		}
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
				// tagPrefix: package.version,
				authToken: env.GITHUB_TOKEN
			}
		}
	]
};
