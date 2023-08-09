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

Now wait for the workflow to start and monitor events.
