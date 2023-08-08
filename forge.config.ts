module.exports = {
	packagerConfig: {
		osxSign: {},
		// ...
		osxNotarize: {
			tool: 'timeoapp',
			appleId: process.env.APPLE_ID,
			appleIdPassword: process.env.APPLE_PASSWORD,
			teamId: process.env.APPLE_TEAM_ID
		}
		// ...
	}
}
