
(function(){
__indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

var pubnub = PUBNUB.init({
    publish_key   : "pub-1f2d2adc-d1d2-49bc-8394-c96c55faecc8",
    subscribe_key : "sub-687f0559-4a45-11e1-91da-85f515a90a37",
    ssl           : false,
    origin        : 'pubsub.pubnub.com'
});

CAH = Ember.Application.create();

CAH.playersController = Ember.ArrayProxy.create({
	content: [],

	createPlayer: function(name, id, isReady) {
		var player = Ember.Object.create({
			name: name, 
			id: id, 
			isReady: isReady
		});
		this.pushObject(player);
	},

	setReady: function(id) {
		//TODO: fix this to update properly (this.replaceContent?)
		this.content = this.content.map(function(item) {
			if(item.id === id) {
				item.set('isReady', true);
			}
		});
	},

	allReady: function() {
		return !!this.get('length') && this.everyProperty('isReady', true);
	}.property('@each.isReady')
});

CAH.PlayersView = Ember.View.extend({
	templateName: 'players',
	contentBinding: 'CAH.playersController.content',
	allReadyBinding: 'CAH.playersController.allReady',
	readyString: function() {
		var allReady = this.get('allReady');
		return 'Waiting' ? !allReady : 'Ready!';
	}.property('allReady')
});

CAH.playersView = CAH.PlayersView.create({});

CAH.tableController = Ember.ArrayProxy.create({
	black_card: function() {
		//TODO: change this to finding the black card
		return this.objectAtContent(0);
	}.property(),

	content: [],

	addCard: function(color, text, id) {
		//if placeholders are present, remove them.
		if(this.content.length !== 0 && this.objectAtContent(0).text === "") {
			this.replaceContent(0, this.content.length, []);
		}
		var card = Ember.Object.create({
			color: color,
			text: text,
			id: id,
			card: "card"
		});
		this.pushObject(card);
		if(color === "black") {
			$(".card span").replaceText(/_/g, "<span class='_'></span>");
		}
	},

	removeAllCards: function() {
		//remove all cards and add placeholders.
		this.replaceContent(0, this.content.length, []);
		this.addCard("black", "", "");
		var num_white = CAH._app.players.length - 1;
		for(var i=0; i<num_white; i++) {
			this.addCard("white", "", "");
		}
	}
});

CAH.handController = Ember.ArrayProxy.create({
	content: [],

	createCard: function(text, id) {
		var card = Ember.Object.create({
			text: text,
			id: id
		});
		this.pushObject(card);
	},

	removeCard: function(id) {
		
	},
});

CAH.TableView = Ember.View.extend({
	templateName: 'cards-in-play',
	contentBinding: 'CAH.tableController.content',
	black_cardBinding: 'CAH.tableController.black_card'
});

CAH.tableView = CAH.TableView.create({});

CAH.HandView = Ember.View.extend({
	templateName: 'cards-hand',
	contentBinding: 'CAH.handController.content',
	black_cardBinding: 'CAH.tableController.black_card'
});

CAH.handView = CAH.HandView.create({});

CAH._app = {
	channel: null,

	set_channel: function(id) {
		this.channel = "room:"+id;
	},

	user_id: null,

	user_name: null,

	emit: function(request, recipients, body) {
		console.log("emit "+request+" to ["+recipients+"]");
		pubnub.publish({
			channel: this.channel,
			message: {request: request, recipients: recipients, body: body}
		});
	},

	match: function(msg) {
		var req = msg.request;
		console.log("\nINCOMING MESSAGE: "+req);
		if(req === "timeout ping") {
			this.emit("timeout ping", 
				[this.SERVER], 
				{id: this.user_id, t_id: msg.body.t_id});
		}
		else if(req === "player joined") {
			//if player doesn't already exist (i.e. ourselves)
			if(__indexOf.call(this.players, msg.body.id) == -1) {
				console.log(msg.body.name+" joined the room.");
				CAH.playersController.createPlayer(msg.body.name, msg.body.id, false);
				this.players.push(msg.body.id);
				this.player_names.push(msg.body.name);
				console.log("all players: "+this.player_names);
			}
		}
		else if(req === "room ready") {
			//save order of players
			this.players = msg.recipients;
			//instantiate player scores array
			for(var i=0; i<this.players.length; i++) {
				this.player_scores.push(0);
			}

			//draw 10 white cards
			this.draw_white_hand();

			//start the game
			if (this.players[0] === this.user_id) {
				//if we are the card czar, enter waiting phase
				this.do_card_czar_wait();
			} else {
				this.do_white_player_choose();
			}
		}
		else if (req === "new card") {
			console.log("received "+msg.body.color+" card: "+msg.body.content);
			if(msg.body.color === "white") {
				this.hand.push(msg.body.content);
				CAH.handController.createCard(msg.body.content, msg.body.id);
			}
			else if(msg.body.color === "black") {
				//TODO: display as black card
				CAH.tableController.addCard(msg.body.color, msg.body.content, msg.body.id);
			}
		}
		else if (req === "selected card") {
			//show chosen card
			CAH.tableController.addCard(msg.body.color, msg.body.content, msg.body.id);
			this.set_played(msg.body.player);
			//TODO:
			//if everyone has selected a card,
			//enter waiting phase
			if(this.players[this.card_czar] === this.user_id) {
				if(this.players_who_have_played.length === this.players.length) {
					this.reset_played();
					this.do_card_czar_choose();
				} else {
					//keep waiting
					this.do_card_czar_wait();
				}
			} else {
				if(this.players_who_have_played.length === this.players.length) {
					this.reset_played();
				}
				this.do_white_player_wait();
			}
		}
		else if (req === "round winner") {
			//record point for winner.
			player_scores[msg.body.played_by]++;

			//remove played cards.
			CAH.tableController.removeAllCards();

			//advance to next card czar.
			if(players[this.next_card_czar()] == this.user_id) {
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

	black_card: null,

	players: [],

	player_names: [],

	player_scores: [],

	players_who_have_played: [],

	card_czar: 0,

	next_card_czar: function() {
		this.card_czar = (this.card_czar++) % players.length;
		return this.card_czar;
	},

	set_played: function(id) {
		if(!(id in this.players_who_have_played)) {
			this.players_who_have_played.push(id);
		}
	},

	reset_played: function() {
		this.players_who_have_played = [];
	},

	do_white_player_wait: function() {
		console.log("\nwhite player wait");
		CAH.handView.remove();
		//TODO: wait until receive msg
	},

	do_white_player_choose: function() {
		console.log("\nwhite player choose");
		//TODO: display hand
		CAH.handView.appendTo("#container");

		//TODO: emit chosen card

		this.do_white_player_wait();
	},

	draw_white_hand: function() {
		if(CAH.handController.get("content").length === 0) {
			this.emit("draw card", [this.SERVER], {color: "white", num: 6, id: this.user_id});	
		}
	},

	draw_white_card: function() {
		if(CAH.handController.get("content").length !== 6) {
			this.emit("draw card", [this.SERVER], {color: "white", num: 1, id: this.user_id});
		}
	},

	draw_black_card: function() {
		this.emit("draw card", [this.SERVER], {color: "black", num: 1, czar_id: this.user_id});
	},

	do_card_czar_choose: function() {
		console.log("\ncard czar choose");
		//TODO

		//this.draw_black_card();
	},

	do_card_czar_wait: function() {
		console.log("\ncard czar wait");
		//TODO

		//TODO: REMOVE
		this.draw_black_card();
		CAH.tableView.appendTo("#container");
		CAH.handView.appendTo("#container");
	},

	announce: function() {
		this.emit("player joined", this.players, {id: this.user_id, name: this.user_name});
	},

	SERVER: "—server—"

};




$(document).ready(function() {
	//console.log(window.location.pathname);
	/*
	CAH.PlayedCards = Ember.Object.extend({
		black_card: "Lorem ipsum dolor sit amet _.",
		cards: [{color: "white", content: "Foo 1"},
			{color: "white", content: "Bar 1"},
			{color: "white", content: "Baz 1"},
			{color: "white", content: "Foo 2"},
			{color: "white", content: "Bar 2"}]
	});
	*/

	/* //WORKING EXAMPLE
	CAH.player = Ember.Object.create({
		name: "John Doe",
		id: "",
		isReady: false
	});

	CAH.playerController = Ember.Object.create({
		contentBinding: "CAH.player"
	});

	CAH.PlayerView = Ember.View.extend({
		templateName: 'single-player',
		nameBinding: 'CAH.playerController.content.name',
		idBinding: 'CAH.playerController.content.id'
	});

	CAH.playerView = CAH.PlayerView.create({});
	*/

	/*
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
	*/

	
	
	var path = window.location.pathname;
	//console.log(path);
	var rooms_match = path.match(/\/rooms\/?/);
	var new_url = "";
	var room_id = "";
	if(typeof rooms_match !== "undefined" && rooms_match !== null) {
		$(".room a").click(function(e) {
			e.preventDefault();
			var url = e.currentTarget.href;
			new_url = url;
			var id_match = url.match(/.*\/room\/(\w*)\/?/);
			room_id = id_match[1];
			$.ajax({
				type: 'PUT',
				url: '/room',
				dataType: 'json',
				data: {id: room_id},
				success: function(data) {
					console.log("put success");
					get_room();
				},
				error: function(error, data) {
					console.log("put error");
				}
			});
		});
	}

	var get_room = function() {
		path = new_url;
		var room_match = path.match(/.*\/room\/(\w*)\/?/);
		if(typeof room_match !== "undefined" && room_match !== null) {
			//get the room id so we can subscribe to the right pubsub channel
			var room_id = room_match[1];
			CAH._app.set_channel(room_id);
			pubnub.subscribe({
			  channel  : CAH._app.channel,
			  connect  : function() {
			  	console.log("subscribed to "+CAH._app.channel);
			  },
			  callback : function(message) {
			  	//console.log("received: "+message.request+" "+message.recipients);
			  	if(__indexOf.call(message.recipients, CAH._app.user_id) >= 0) {
			  		CAH._app.match(message);
			  	}
				}
			});
	
			//get user id and list of players in room
			var req = $.ajax({
				type: 'GET',
				url: '/room/'+room_id,
				contentType: 'application/json',
				accepts: 'json',
				success: function(data) {
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
					console.log(CAH._app.user_name);
					$("#rooms").hide();
					CAH.playersView.appendTo("#container");

					for(var i=0; i<CAH._app.players.length; i++) {
						CAH.playersController.createPlayer(CAH._app.player_names[i], CAH._app.players[i], false);	
					}
					CAH._app.announce();
					start_room();
				}
			});

			console.log("hello");
			console.log(CAH._app);
			
		}
	};

	var start_room = function() {
		$.ajax({
				type: 'PUT',
				url: '/room/start',
				dataType: 'json',
				data: {player_id: CAH._app.user_id, room_id: room_id},
				success: function(data) {
					console.log("start success");
					CAH._app.emit("timeout ping", 
						[CAH._app.SERVER], 
						{id: CAH._app.user_id});
				},
				error: function(error, data) {
					console.log("start error");
					console.log(data);
				}
			});
	};
});

console.log('here here');

})();