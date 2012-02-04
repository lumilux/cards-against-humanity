(function(){
__indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

var output = PUBNUB.$('output');

var pubnub = PUBNUB.init({
    publish_key   : "pub-1f2d2adc-d1d2-49bc-8394-c96c55faecc8",
    subscribe_key : "sub-687f0559-4a45-11e1-91da-85f515a90a37"
});

$("#ping").click(function() {
	PUBNUB.publish({
		channel: 'my_browser_channel',
		message: 'ping. '
	});
});

var app = {
	channel: null,

	set_channel: function(id) {
		this.channel = "room:"+id;
	},

	user_id: null,

	emit: function(request, recipients, body) {
		PUBNUB.publish({
			channel: this.channel,
			message: {request: request, recipients: recipients, body: body}
		});
	},

	match: function(msg) {
		var req = msg.request;
		if(req === "room ready") {
			//save order of players
			this.players = msg.recipients;
			//instantiate player scores array
			for(var i=0; i<this.players.length; i++) {
				this.player_scores.push(0);
			}

			//draw 10 white cards
			for(var i=0; i<10; i++) {
				this.emit("draw card", [this.SERVER], 
					{color: "white", player: this.user});
			}

			//start the game
			if (this.players[0] === this.user) {
				//if we are the card czar, enter waiting phase
				this.do_card_czar_wait();
			} else {
				this.do_white_player();
			}
		}
		else if (req === "new card") {
			if(msg.body.color === "white") {
				this.hand.push(msg.body.content);
			}
			else if(msg.body.color === "black") {
				//TODO: display as black card
			}
		}
		else if (req === "selected card") {
			//if this is received, we are the card czar
			//TODO:
			//if everyone has selected a card,
			//enter waiting phase
			this.do_card_czar_choose();
		}
		else if (req === "round winner") {
			//record point for winner.
			player_scores[msg.body.played_by]++;

			//advance to next card czar.
			if(players[this.next_card_czar()] == this.user) {
				//if we're next, enter waiting phase
				this.do_card_czar_wait();
			} else {
				//otherwise, enter white choosing phase
				this.do_white_player();
			}
		}
		else if (req === "room end") {
			//TODO: the game is over. display scores.
		}
	},

	hand: [],

	players: [],

	player_scores: [],

	card_czar: null,

	next_card_czar: function() {
		this.card_czar = (this.card_czar++) % players.length;
		return this.card_czar;
	},

	do_white_player: function() {
		
	},

	draw_white_card() {
		this.emit("draw card", [this.SERVER], {color: "white"});
	},

	draw_black_card() {
		this.emit("draw card", [this.SERVER], {color: "black"});
	},

	do_card_czar: function() {
		
	},

	SERVER: "—server—"

};

$(document).ready(function() {
	console.log(window.location.pathname);
	
	
	var CAH = Ember.Application.create();
	
	var path = window.location.pathname;
	
	var room_match = path.match(/\/room\/(\w*)\/?/)

	if(typeof room_match !== "undefined" && room_match !== null) {
		//get the room id so we can subscribe to the right pubsub channel
		var room_id = room_match[1];
		app.set_channel(room_id);

		//get user id and list of players in room
		$.ajax({
			url: '/room/'+room_id,
			accepts: 'json',
			success: function(data) {
				app.user = data.user;
				app.players = data.players;
			}
		});

		//subscribe to the pubsub channel
		PUBNUB.subscribe({
		    channel  : app.channel,
		    callback : function(message) {
		    	if(__indexOf.call(message.recipients, app.user) >= 0) {
		    		app.match(message);
		    	}
		  	}
		});

		$(document).append('div');//.text('blah');
		
		
		console.log("in /rooms");
		CAH.Room = Ember.Object.extend({
			room_name: "default",
			id: "0",
			
			name: function(rm) {
				this.get('room_name');
			}
		});
		
		var rm = CAH.Room.create({
			name: "room A B",
			id: "1"
		});
		console.log(rm);
		
		
		
	}
	
});

console.log('here here');
console.log($('#username'));

// replace single underscores in black cards with a fancy blank line
$(".card span").replaceText("_", "<span class='_'></span>");

})();