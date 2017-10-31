const io = require('socket.io')();
var randomstring = require("randomstring");

//database for storing pending games
var db = {};

io.on('connection', (client) => {
  var gameId = undefined;
  var started = false;
  client.on('create', (props, c) => {
    const id = randomstring.generate({
      length: 5,
      charset: 'numeric'
    });
    gameId = id;
    client.join(id);
    db[id] = props;
    c(id);
  });
  client.on('join', (id, c) => {
    var props = db[id];
    if(!props) {
      c(false);
    }
    else{
      gameId = id;
      io.to(id).emit('join');
      client.join(id);
      delete db[id];
      c(props);
    }
  });
  client.on('move', (props) => {
    io.to(gameId).emit('move', props);
  });
  client.on('disconnect', () => {
    if(gameId && db[gameId]){
      delete db[gameId];
    }
    else if(gameId && !db[gameId]) {
      io.to(gameId).emit('leave');
    }
  });
});

io.listen(process.env.PORT || 8008);
console.log('listening on port ', port);
