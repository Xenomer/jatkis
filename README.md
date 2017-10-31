# jatkis
Jatkis is a multiplayer tic-tac-toe game that has customizable grid size. It requires an api service and the react web page itself. The name comes from it's finnish name "jätkänshakki".

## Screenshots
![screenshot](img/ss1.png?raw=true)
![screenshot](img/ss2.png?raw=true)

## Installation
1. Download the source folder

2. Navigate into /src/ folder and create a file `config.json` and put the following content into it:
```json
{
  "API": "localhost:8008"
}
```  
Edit the localhost address to your apis address (use localhost if the api service is on the same machine) and port (the api listens on 8008 by default but it can be changed by setting PORT environment variable)

3. If you are running jatkis on /jatkis/ path (e.g. mysite.com/jatkis/), skip this step.
Edit package.json file by changing the line
```json
"homepage": "http://localhost/jatkis",
```
to
```json
"homepage": "http://localhost/yourpath",
```
where yourpath is your sites path (or empty for site root)

4. Run `npm run build` to build the react app and then serve the files on the /build/ directory

5. Run `node server.js` to start the api
