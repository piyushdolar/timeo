const config = require("dotenv");
const env = config.config()
module.exports = {
	packagerConfig: {
		asar: true,
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
			name: '@electron-forge/maker-dmg',
			config: {
				background: './assets/images/dmg-background.png',
				format: 'ULFO'
			}
		},
		{
			name: '@electron-forge/maker-deb',
			config: {},
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
