
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , socket = require('socket.io');

var _ = require('underscore');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

var server = http.createServer(app);
var io = socket.listen(server);

server.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});

app.get('/', function(req, response) {
  response.sendfile(__dirname + '/index.html');
});


var status = {
  actions      : [],
  players      : [],
  actionsCount : 0, 
  player1Count : 0,
  player2Count : 0
};



io.sockets.on('connection', function(client) {  
  console.log('Client connected...');
  if (status.players[0] !== undefined &&
        status.players[1] !== undefined ) {
    client.emit('playersLimit', status.players);
  }
  else{ 
    client.emit('allowJoin');
  }

  client.on('join', function(username) {
    // set username associate to the client
      client.set('username', username);
      status.players.push(username);

      // emit all the currently logged in chatters
      client.emit('updatePlayers', status.players);
      client.broadcast.emit('updatePlayers', status.players);
    });

  client.on('disconnect', function(){
    client.get('username', function(err, username){
     status.players = _.without(status.players, username);
      client.emit('updatePlayers', status.players);
      client.broadcast.emit('updatePlayers', status.players);
    });
  });

});