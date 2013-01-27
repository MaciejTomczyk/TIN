
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
  playerLeftName    : null, 
  playerRightName   : null, 
  playerLeftAction  : 0,
  playerRightAction : 0
};



io.sockets.on('connection', function(client) {
  console.log('Client connected...');
  if (status.playerLeftName !== null && status.playerRightName !== null) {
    client.emit('playersLimit', status);
  }
  else{ 
    client.emit('allowJoin');
  }


  client.on('join', function(username) {
    // set username associate to the client
      client.set('username', username);
      if (status.playerLeftName === null) {
        status.playerLeftName = username;
      }
      else {
          status.playerRightName = username;
      } 

      // emit all the currently logged in players
      client.emit('updatePlayers', status);
      client.broadcast.emit('updatePlayers', status);
    });



  client.on('disconnect', function(){
    client.get('username', function(err, username){
     if (status.playerLeftName === username) {
      status.playerLeftName = null;
     }
     else {
      status.playerRightName = null;
     }
      
      client.broadcast.emit('updatePlayers', status);
    });
  });

});