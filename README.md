# Timeo

An electron based repository for time management for office

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

````
npx electron-forge import (This will update forge.config.js file)
npm run make -- --platform win32
npm run make -- --platform linux
npm run make -- --platform darwin```

# Publish (`npm run publish`)

This command used to available public access in github release

To publish we're using `npm run publish` which is required the GITHUB_TOKEN to set and GitHub URL to set in forge.config.js file

This will create executable file and deploy new release to the github repo, can see under the release section to verify.

`npm run publish` will auto create github tag and run the actions of workflow to deploy it as release (this work same as `git tag v1.0.0` command and `git push --tag`)

# electron-builder -mwl (alternative)

This is another command to build all application in one platform but it'll required the certificate to sign in
`export CSC_IDENTITY_AUTO_DISCOVERY=false`
````
