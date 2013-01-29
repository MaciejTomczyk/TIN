(function() {

	var socket = io.connect(window.location.hostname);

	var $title = $('title'),
		$leftName = $('#playerLeftName'),
		$rightName = $('#playerRightName');
		$leftStep = $('#stepLeft'),
		$rightStep = $('#stepRight');



	socket.on('playersLimit', function(status) {
		alert("Players limit reached! You can not join this game, but you still can watch the progress!");
		$leftName.empty();
		$rightName.empty();

		$('<h2>',{html: status.playerLeftName}).appendTo($leftName);	
		$('<h2>',{html: status.playerRightName}).appendTo($rightName);
	});

	socket.on('allowJoin', function() {
		var username = prompt("Please enter your name:");
		username = username ? username : "Someone";
		socket.emit('join', username);
	});


	socket.on('updatePlayers', function(status) {

		$leftName.empty();
		$rightName.empty();
		if (status.playerLeftName !== null) {
			$('<h2>',{html: status.playerLeftName}).appendTo($leftName);
		}
		else {
			$('<h2>',{html: 'Empty'}).appendTo($leftName);
		}
		if (status.playerRightName !== null) {
			$('<h2>',{html: status.playerRightName}).appendTo($rightName);
		}
		else {
			$('<h2>',{html: 'Empty'}).appendTo($rightName);
		}
	});

	socket.on('updateSteps', function(status) {

		$leftStep.empty();
		$rightStep.empty();
		if (status.playerLeftName !== null) {
			if (status.actions[status.playerLeftAction] !== undefined) {
				$('<p>',{html: status.actions[status.playerLeftAction]}).appendTo($leftStep);
			}
			else {
				$('<p>',{html: 'KONIEC!'}).appendTo($leftStep);
			}
		}
		if (status.playerRightName !== null) {
			if (status.actions[status.playerRightAction] !== undefined) {
				$('<p>',{html: status.actions[status.playerRightAction]}).appendTo($rightStep);
			}
			else {
				$('<p>',{html: 'KONIEC!'}).appendTo($rightStep);
			}

		}
	});

	$('#next').on('click', function() {
		socket.emit('next');
	});

})();