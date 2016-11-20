# Simple Updater Example

This example shows how to use advanced features of electron-simple-updater

This example uses 
[electron-builder](https://github.com/electron-userland/electron-builder)
for building installer and update package and 
[electron-simple-publisher](https://github.com/megahertz/electron-simple-publisher)
to simplify release publishing

It can be built and publish by the single command:

    npm run release -- -- --transport-token<Your Github API Token>
    
where `-- --` allows to pass arguments through npm.

Also you can save github api token to publisher.json if you use
a private repository.
