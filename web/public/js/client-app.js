
(function(){
__indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

var output = PUBNUB.$('output');

var pubnub = PUBNUB.init({
    publish_key   : "pub-1f2d2adc-d1d2-49bc-8394-c96c55faecc8",
    subscribe_key : "sub-687f0559-4a45-11e1-91da-85f515a90a37"
});

var CAH = Ember.Application.create();
CAH._app = {
	channel: null,

	set_channel: function(id) {
		this.channel = "room:"+id;
	},

	user_id: null,

	user_name: null,

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
				this.do_white_player_choose();
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
			if(this.players_who_have_played.length === this.players.length) {
				this.do_card_czar_choose();
			} else {
				//show chosen card

				//keep waiting
				this.do_card_czar_wait();
			}
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
				this.do_white_player_choose();
			}
		}
		else if (req === "room end") {
			//TODO: the game is over. display scores.
		}
	},

	hand: [],

	players: [],

	player_names: [],

	player_scores: [],

	players_who_have_played: [],

	card_czar: 0,

	next_card_czar: function() {
		this.card_czar = (this.card_czar++) % players.length;
		return this.card_czar;
	},

	do_white_player_wait: function() {
		CAH.HandView.remove();
		//TODO: wait until receive msg
	},

	do_white_player_choose: function() {
		//TODO: display hand
		CAH.HandView.append("#container");

		//TODO: emit chosen card

		this.do_white_player_wait();
	},

	draw_white_card: function() {
		this.emit("draw card", [this.SERVER], {color: "white"});
	},

	draw_black_card: function() {
		this.emit("draw card", [this.SERVER], {color: "black"});
	},

	do_card_czar_choose: function() {
		
	},

	do_card_czar_wait: function() {
		//	
	},

	announce: function() {
		emit("player joined", this.players, {id: this.user_id, name: user_name});
	},

	SERVER: "—server—"

};




$(document).ready(function() {
	console.log(window.location.pathname);

	CAH.playedCards = Ember.Object.create({
		black_card: "Lorem ipsum dolor sit amet _.",
		cards: [{color: "white", content: "Foo 1"},
			{color: "white", content: "Bar 1"},
			{color: "white", content: "Baz 1"},
			{color: "white", content: "Foo 2"},
			{color: "white", content: "Bar 2"}]
	});

	CAH.playedCardsView = Ember.View.create({
		templateName: 'cards-in-play',
		cardsBinding: CAH.playedCards.cards
	});
	
	CAH.hand = Ember.Object.create({
		black_card: "Lorem ipsum dolor sit amet _.",
		cards: [{color: "white", content: "Foo 1"},
			{color: "white", content: "Bar 1"},
			{color: "white", content: "Baz 1"},
			{color: "white", content: "Foo 2"},
			{color: "white", content: "Bar 2"},
			{color: "white", content: "Baz 2"}]
	});

	CAH.handView = Ember.View.create({
		templateName: 'cards-hand',
		cardsBinding: Ember.Binding.oneWay('CAH.hand.cards')
	});


	
	
	var path = window.location.pathname;
	console.log(path);
	var rooms_match = path.match(/\/rooms/);
	var new_url = "";
	if(typeof rooms_match !== "undefined" && rooms_match !== null) {
		$(".room a").click(function(e) {
			e.preventDefault();
			console.log("link disabled.");
			var url = e.currentTarget.href;
			new_url = url;
			var id_match = url.match(/.*\/room\/(\w*)\/?/);
			$.ajax({
				type: 'PUT',
				url: '/room',
				dataType: 'json',
				data: {id: id_match[1]},
				success: function(data) {
					console.log("hello!");
					get_room();
				}
			});
		});
	}

	var get_room = function() {
		path = new_url;
		console.log(path);
		var room_match = path.match(/.*\/room\/(\w*)\/?/);
		if(typeof room_match !== "undefined" && room_match !== null) {
			//get the room id so we can subscribe to the right pubsub channel
			var room_id = room_match[1];
			CAH._app.set_channel(room_id);
	
			//get user id and list of players in room
			var req = $.ajax({
				type: 'GET',
				url: '/room/'+room_id,
				contentType: 'application/json',
				accepts: 'json',
				success: function(data) {
					console.log("it worked!");
					CAH._app.user_id = data.user;
					CAH._app.player_names = data.names;
					CAH._app.players = data.players;
					//TODO: set user name

					CAH._app.user_name = (function(){
						for(var i=0; i<CAH._app.players.length; i++) {
							if(CAH._app.players[i] === CAH._app.user_id) {
								return CAH._app.player_names[i];
							}
						}
					})();
					console.log(CAH);
					console.log(CAH._app);
					CAH.playedCardsView.appendTo("#container");
				}
			});
			//$.get('/room/'+room_id, function(data) {
			//	console.log("it worked.");
			//});
	
			console.log("after ajax get, before pubnub");
	
			//subscribe to the pubsub channel
			PUBNUB.subscribe({
			    channel  : CAH._app.channel,
			    callback : function(message) {
			    	if(__indexOf.call(message.recipients, app.user_id) >= 0) {
			    		CAH._app.match(message);
			    	}
			  	}
			});
	
			$(document).append('div');//.text('blah');
			
			/*
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
			*/
			console.log("hello");
			console.log(CAH._app);
			
		}
	};
});

console.log('here here');

// replace single underscores in black cards with a fancy blank line
$(".card span").replaceText("_", "<span class='_'></span>");

})();