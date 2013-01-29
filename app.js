
/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
    socket = require('socket.io');

var rec = require('./databases/recipies.js').recipies
var taffy = require('taffy'),
    recipies = taffy(rec);

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function (){
  app.use(express.errorHandler());
});

var server = http.createServer(app);
var io = socket.listen(server);

server.listen(app.get('port'), function () {
  console.log("Listening on " + app.get('port'));
});

//  GAME STATE
var status = null;

// ROUTES 

app.get('/game', function(req, res, next){
  if(status !== null) {
    res.render('game');
  }
  else {
    res.redirect('/');
  }
});

app.get('/', function(req, res) {
  if(status === null) {
    res.render('home', {
      //wybiera wszystkie nazwy przepisów jako tablice
      recipies: recipies().select('recipieName')
    });
  }
  else {
    res.redirect('/game');
  }
});
//funkcja po wybraniu przepisu
app.post('/', function(req, res) {
  //tworzy akcje użytkowników
  var przepis = req.body.recipie;
  var steps = recipies({recipieName: przepis}).first().steps;
  //console.log(steps);
  status = {
    actions           : steps,
    playerLeftName    : null, 
    playerRightName   : null, 
    playerLeftAction  : 0,
    playerRightAction : 0
  };
  res.redirect('/game');
});



//  SOCKET IO 

io.sockets.on('connection', function(client) {
  console.log('Client connected...');
  if (status.playerLeftName !== null && status.playerRightName !== null) {
    client.emit('playersLimit', status);
  }
  else{ 
    client.emit('allowJoin');
  }

client.on('join', function(username) {
    // ustawianie nazwy użytkownika/połączenia
      client.set('username', username);
      if (status.playerLeftName === null) {
        status.playerLeftName = username;
      }
      else {
          status.playerRightName = username;
      } 

      
      client.emit('updatePlayers', status);
      client.broadcast.emit('updatePlayers', status);
      if(status.playerLeftName !== null && status.playerRightName !== null){
      client.emit('updateSteps', status);
      client.broadcast.emit('updateSteps', status);
    }
    });

  client.on('disconnect', function(){
    client.get('username', function(err, username){
     if (status.playerLeftName === username) {
      status.playerLeftName = null;
     }
     else if(status.playerRightName === username) {
      status.playerRightName = null;
     }
     if (status.playerLeftName === null && status.playerRightName === null) {
      status = null;
     }
      
      client.broadcast.emit('updatePlayers', status);
    });
  });

  client.on('next', function(){
    client.get('username', function(err, username){
      console.log(username);
     if (status.playerLeftName === username) {
      status.playerLeftAction++;
     }
     else if(status.playerRightName === username) {
      status.playerRightAction++;
     }
      client.emit('updateSteps', status);
      client.broadcast.emit('updateSteps', status);
    });
  });

});