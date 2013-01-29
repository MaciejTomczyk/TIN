/*jshint node:true */
/*global io:true */
'use strict';
(function() {

	var socket = io.connect(window.location.hostname);

	
		var $leftName = $('#playerLeftName'),
		$rightName = $('#playerRightName'),
		$leftStep = $('#stepLeft'),
		$rightStep = $('#stepRight'),
		$button = $('#button');


	//blokada dołączania
	socket.on('playersLimit', function(status) {
		alert("Players limit reached! You can not join this game, but you still can watch the progress!");
		$leftName.empty();
		$rightName.empty();
		$button.empty();

		$('<p>',{html: "<center>Miłego oglądania</center>"}).appendTo($button);
		$('<h2>',{html: status.playerLeftName}).appendTo($leftName);	
		$('<h2>',{html: status.playerRightName}).appendTo($rightName);
	});
	//dołączanie graczy
	socket.on('allowJoin', function() {
		var username = prompt("Please enter your name:");
		username = username ? username : "Someone";
		socket.emit('join', username);
	});

    //odświeżanie graczy
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
	//odświeżanie akcji
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
	//przełączanie na kolejną akcję
	$('#next').on('click', function() {
		socket.emit('next');
	});

})();