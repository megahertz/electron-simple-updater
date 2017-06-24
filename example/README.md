# Simple Updater Example

This example shows how to use advanced features of electron-simple-updater

This example uses 
[electron-builder](https://github.com/electron-userland/electron-builder)
for building installer and update package and 
[electron-simple-publisher](https://github.com/megahertz/electron-simple-publisher)
to simplify release publishing.

It can be built and published by the single command:

    npm run release -- -- --transport-token<Your Github API Token>
    
where `-- --` allows to pass arguments through npm.

Also you can save github api token to publisher.json if you use
a private repository.

If you want to prepare a `updates.json` file manually remember that Squirrel.Mac requires a properly prepared `release.json` file. A release in the property `url` must be zipped .app file.
