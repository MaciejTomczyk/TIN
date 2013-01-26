(function() {

	var socket = io.connect(window.location.hostname);

	var $title = $('title'),
		$leftName = $('#playerLeftName'),
		$rightName = $('#playerRightName');



	socket.on('playersLimit', function(players) {
		alert("Players limit reached! You can not join this game, but you still can watch the progress!");
		$leftName.empty();
		$('<h2>',{html: players[0]}).appendTo($leftName);
		$rightName.empty();
		$('<h2>',{html: players[1]}).appendTo($rightName);
	});

	socket.on('allowJoin', function() {
		var username = prompt("Please enter your name:");
		username = username ? username : "Someone";
		socket.emit('join', username);
	});


	socket.on('updatePlayers', function(players) {

		$leftName.empty();
		$('<h2>',{html: players[0]}).appendTo($leftName);

		if (players[1] !== undefined) {
			$rightName.empty();
			$('<h2>',{html: players[1]}).appendTo($rightName);
		}
	});



})();