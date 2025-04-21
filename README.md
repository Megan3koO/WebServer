# How to set up
## Install dependencies
- First install NPM: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- Install morgue: npm install backtrace-morgue -g
- Run setupEnv.bat to install required dependencies and set up credentials (username and password)

## Set up morgue using password
- login to backtrace -> Organization settings -> Authentication -> Authentication method -> Password -> Change password
- After setting up the password, now we can login with password

## Set up morgue using token
If you are not logging in with password, you can login with token:
- Logging to backtrace with SSO login -> Organization settings: copy the login command and run it in terminal

## Set up server
- Run startServer.bat

## How to use Morgue
- Github repo: https://github.com/backtrace-labs/backtrace-morgue
- Morgue is a CLI to the Backtrace object store. It allows you to upload, download and issue queries on objects with-in the object store.