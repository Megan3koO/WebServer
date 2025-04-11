# How to set up
## Install dependencies
- First install NPM: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm
- Go to scripts -> Run setupEnv.bat to install required dependencies

## Set up morgue using token
- npm install backtrace-morgue -g
- login using token from backtrace -> Organization settings

## Set up morgue using password
- npm install backtrace-morgue -g
- login to backtrace -> Organization settings -> Authentication -> Authentication method -> Password -> Change password
- After setting up the password, now we can login with password
- Go back to server -> Scripts
- Run generateRSAKey.py
- Run encrypteCredential.py next and input username and password

## Set up server
- Run startServer.bat

## How to use Morgue
- Github repo: https://github.com/backtrace-labs/backtrace-morgue
- Morgue is a CLI to the Backtrace object store. It allows you to upload, download and issue queries on objects with-in the object store.