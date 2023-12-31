# Timeo

An electron based repository for time management for office.

## Screenshots

![timeo - dashboard](/timeo%20-%20dashboard.png)
![timeo - history](/timeo%20-%20history.png)
![timeo - notification](/timeo%20-%20notification.png)
![timeo - settings](/timeo%20-%20settings.png)
![timeo - update](/timeo%20-%20update.png)
![timeo - change background](/timeo%20-%20change%20background.png)

## Table of Contents

-   [Features](#features)
-   [Installation](#installation)
-   [Issues](#Issues)

## Features

-   **Notification:** You will get notified for your checkout time at 30 minutes, 15 minutes, and 5 minutes before times run out.

-   **Manual time:** You also can adjust arriving time to start the your own timer.

-   **Auto start timer:** Although it’ll start auto check in upon your arrival between 7:55am to 8:30am, after arriving 8:15am you will needs to setup your custom check in time.

-   **Today’s activity:** You’ll get each activities throughout your day such as Screen lock, Screen unlock.

-   **Reports:** You can see your post days history report.

## Installation

Download latest version of release and install it, since the app code is unsigned make sure to disable your antivirus first in order to install application.

## Issues

1. Generate GITHUB_TOKEN from personal access token in github settings to use in local during development to push code into repo.
2. Give read and write permission to workflow in repo setting to publish the packages
3. use below three command to deploy new version and publish it

```
git commit -am "commit name"
git tag "v1.0.0"
git push && git push --tags
```

4. Inside forge.config.js

```
{
	name: '@electron-forge/publisher-github',
	config: {
		repository: {
			owner: 'piyushdolar',
			name: 'timeo'
		},
		prerelease: false,
		draft: true,
		// tagPrefix: package.version,
		authToken: env.GITHUB_TOKEN
	}
}
```

# Make (`npm run make`)

This command used for to locally create executable to test in system, also can use this below commands to make it cross-platform build

```
npx electron-forge import (This will update forge.config.js file)
npm run make -- --platform win32
npm run make -- --platform linux
npm run make -- --platform darwin
```

# Publish (`npm run publish`)

This command used to available public access in github release

To publish we're using `npm run publish` which is required the GITHUB_TOKEN to set and GitHub URL to set in forge.config.js file

This will create executable file and deploy new release to the github repo, can see under the release section to verify.

`npm run publish` will auto create github tag and run the actions of workflow to deploy it as release (this work same as `git tag v1.0.0` command and `git push --tag`)

# electron-builder -mwl (alternative)

This is another command to build all application in one platform but it'll required the certificate to sign in
`export CSC_IDENTITY_AUTO_DISCOVERY=false`
