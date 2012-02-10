var Room = mongoose.model('Room');
var User = mongoose.model('User');
var Card = mongoose.model('Card');

__indexOf = Array.prototype.indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

var pubnub = require('pubnub');

var network = pubnub.init({
    publish_key   : "pub-1f2d2adc-d1d2-49bc-8394-c96c55faecc8",
    subscribe_key : "sub-687f0559-4a45-11e1-91da-85f515a90a37",
    ssl           : false,
    origin        : 'pubsub.pubnub.com'
});

var channel_name = null;

var emit = function(request, recipients, body) {
  console.log("emit: "+request+" to ["+recipients+"]");
  network.publish({
    channel: channel_name,
    message: {request: request, recipients: recipients, body: body}
  });
};

var setEquals = function(a, b) {
  if(a.length === b.length) {
    return true;
  }
  for(var i=0; i<a.length; i++) {
    for(var j=0; j<b.length; j++) {
      if(a[i] !== b[j]) {
        return false;
      }
    }
  }
  return true;
};

var fisherYates = function(array) {
  var tmp, current, top = array.length;
  if(top) while(--top) {
      current = Math.floor(Math.random() * (top + 1));
      tmp = array[current];
      array[current] = array[top];
      array[top] = tmp;
  }
  return array;
};

var emitNewWhiteCards = function(num, room_id, user_id, end_room) {
  Room
  .findById(room_id, function(err, room) {
    var chosen_cards = room.white_cards.slice(-num);
    
    if(chosen_cards.length === 0) {
      end_room();
    }

    Room
    .update({_id: room_id},
      {"$pullAll": {white_cards: chosen_cards}},
      function(err, room) {});

    Card.find({_id: {"$in": chosen_cards}}, function(err, cards) {
      if(err || !cards) {
        console.log("couldn't get cards");
        return next(new Error('Failed to load cards'));
      }
      else {
        console.log("cards: "+cards.length);
        cards.forEach(function(card) {
          console.log("sent card: "+card.text);
          emit("new card", [user_id], 
            {color: "white", content: card.text, id: card._id});
        });
      }
    });
  });
};

var emitNewBlackCard = function(room_id, players, czar_id, end_room) {
  Room
  .findById(room_id, function(err, room) {
    var chosen_card = room.black_cards.slice(-1);

    if(chosen_card.length === 0) {
      end_room();
    }

    Room
    .update({_id: room_id},
      {"$pullAll": {black_cards: chosen_card}},
      function(err, room) {});
    
    Card.findOne({_id: chosen_card[0]}, function(err, card) {
      if(err || !card) {
        console.log("couldn't get card");
        return next(new Error('Failed to load card'));
      }
      else {
        console.log("sent card: "+card.text);
        emit("new card", players, {
          color: "black", 
          content: card.text, 
          id: card._id, 
          czar_id: czar_id
        });
      }
    });
  });
};

//TODO: emit new black card to all players

//start game
var start_game = function(room_id, players, next) {
  console.log("in start_game");
  players = fisherYates(players);
  console.log("random shuffled the players. "+players);

  //TODO: something is wrong with this subscribe call.
  //Unexpected token ILLEGAL in the room name?!
  //listen to PubNub channel for card requests and timeouts.
  channel_name = "room:"+room_id;
  network.subscribe({
    channel: channel_name,

    connect: function() {
      console.log("subscribed to "+channel_name);
      emit("room ready", players, {});
    },

    callback: function(msg) {
      //console.log("received: "+msg.request+" "+msg.recipients);

      //we only care if the message was addressed to us.
      if(msg.recipients && msg.recipients[0] === "—server—") {
        var r = msg.request;

        if(r === "timeout ping") {
          console.log("timeout ping received");

          if(msg.body.t_id !== null && msg.body.t_id !== "undefined") {
            console.log("timeout cancelled: "+msg.body.id);
            clearTimeout(parseInt(msg.body.t_id, 10));
          }

          Room
            .findById(room_id, function(err, room) {
              if(__indexOf.call(room.players, msg.body.id) >= 0) {
                setTimeout(function () {
                  console.log("timeout set");
                  var t_id = setTimeout(function() {
                    Room
                      .findById(room_id)
                      .update({"$pull": {players: msg.body.id}},
                        function(err, room) {
                          console.log("timed out and removed: "+msg.body.id);
                        }
                    );
                  }, 30000);
                  t_id = t_id.toString();
                  emit("timeout ping", [msg.body.id], {t_id: t_id});
                }, 30000);
              }
            });
        }
        else if(r === "draw card") {
          console.log("msg.body.num: "+msg.body.num);
          var room_end = function() {
            emit("room end", players, {});
          }
          if(msg.body.color === "white") {
            emitNewWhiteCards(msg.body.num, room_id, msg.body.id, room_end);
          }
          else if(msg.body.color === "black") {
            emitNewBlackCard(room_id, players, msg.body.czar_id, room_end);
          }
        }
      }
    }
  });
};

module.exports = function(app) {
  app.get('/room/example', function(req, res) {
    res.render('example', {title: ""});
  });

  app.post('/rooms', function(req, res, next) {
    var room = new Room(req.body.room);
    room.save(function(err) {
      if(err) {
        res.render('rooms/new', {
          title: 'New Room - error',
          room: room
        });
      } else {
        //TODO: save random shuffling of black and white cards to room
        Card.find().run(function(err, cards) {
          var white_cards = [];
          var black_cards = [];
          cards.forEach(function(card) {
            if(card.color === "white") {
              white_cards.push(card._id);
            } else if(card.color === "black") {
              black_cards.push(card._id);
            }
          });

          white_cards = fisherYates(white_cards);
          black_cards = fisherYates(black_cards);

          Room
            .findById(room._id, function(err, room) {
              if(err || !room) {
                console.log("could not get room to add cards");
                return next(new Error("could not load room"));
              }
              else {
                black_cards.forEach(function(card) {
                  room.black_cards.push(card);
                });
                white_cards.forEach(function(card) {
                  room.white_cards.push(card);
                });

                room.save(function(err) {
                  if(err) {
                    console.log("could not get room to add cards");
                    return next(new Error("could not load room"));
                  }
                  else {
                    console.log("saved "+black_cards.length+" black cards and "+white_cards.length+" white cards to room.");
                    res.redirect('/room/'+room._id);
                  }
                });
              }
            });
          });
      }
    });
  });

  app.get('/rooms/new', function(req, res) {
    res.render('rooms/new', {
      title: 'Create New Room',
      room: new Room({})
    });
  });

  app.param('id', function(req, res, next, id) {
    Room
      .findById(id, function (err, room) {
        if (err) return next(err);
        if (!room) return next(new Error('Failed to load Room ' + id));
        req.room = room;
        next();
      });
  });

  app.get('/room/:id', function(req, res) {
    console.log("get");
    var r_room = req.room;
    Room
      .findOne({_id: r_room._id})
      .run(function(err, room) {
        var players = [];
        User
          .find({cookie_id: {"$in": room.players}},
          function(err, users) {
            var players = [];
            var player_names = [];

            users
              .forEach(function(user) {
                players.push(user.cookie_id);
                player_names.push(user.name);
            });

            //if(req.is('application/json')) {
              res.json({
                user: req.session.id
              , names: player_names
              , players: players
              });
            /*} else {
              res.render('rooms/show', {
                title: 'Room',
                room: room,
                players: players
              });
            }*/
          });
    });
  });

  app.put('/room', function(req, res) {
    var room_id = req.body.id;

    console.log("PUT received");
		console.log("room_id: " + room_id);
    console.log("session: "+req.session.id);

    User
      .findOne({cookie_id: req.session.id})
      .run(function(err, user) {

        if(err) console.log("couldn't find user with session id "+req.session.id);
        
        if(!user) {
          res.render('users/new', {
              title: 'Type your name'
            , user: new User()
          });
        }
        else {
          console.log("user: "+user);
          var uid = user.cookie_id;
          console.log("user.cookie_id: "+user.cookie_id);
          console.log("req.room._id:"+room_id);
          Room
            .update({_id: room_id},
              {"$addToSet": {players: uid}},
              function(err) {
                User
                  .update({_id: uid}, {},
                    function(err, user) {
                      console.log("updated players");
                      // console.log("room: "+req.room);
                      req.session.room = room_id;
                      //res.redirect('/room/'+room_id);
                      res.json(null, 200);
                    }
                  );
              }
            );

        }
      });
  });

  app.del('/room/', function(req, res) {
    console.log("leaving room");
		var room_id = req.body.id
    console.log(req.session.id);
    var room = req.room;
    Room
      .update({_id: room_id},
        {"$pull": {players: req.session.id}},
        function(err, room) {
          //if no one left in room, delete room
          if(room.players.length == 0) {
            Room.remove({_id: room_id}, function(err) {});
          }
        }
      );
    res.redirect('/rooms');
  });

  app.put('/room/start', function(req, res, next) {
    console.log("start received");
		var room_id = req.body.room_id;
    var channel_name = "room:"+room_id;
		var player_id = req.body.player_id;

    // add player to ready_players.
    console.log("add player to ready_players");
    Room
      .findById(room_id, function(err, room) {
        if(err || !room) {
          console.log("error: addToSet "+channel_name);
          console.log(room);
          return next(new Error("could not load room"));
        } else {
          console.log(channel_name);
          console.log("room.players: "+room.players);
          console.log("room.ready_players: "+room.ready_players);

          //add this player as ready
          if(__indexOf.call(room.ready_players, player_id) == -1){
            room.ready_players.push(player_id);
          }

          room.save(function(err) {
            if(err) {
              console.log("could not save room");
              return next(new Error("could not load room"));
            }
            else {
              console.log("saved room!");
              
              //if all players are ready, start game
              if(setEquals(room.players, room.ready_players)) {
                start_game(room_id, room.ready_players, next);
              }
              else {
                console.log("everyone is not ready.");
                console.log("players: "+room.players);
                console.log("ready_players: "+room.ready_players);
              }
              res.json(null, 200);
            }
          });
        }
      });
  });

  // list available rooms
  app.get('/rooms', function(req, res) {
    User
      .find({cookie_id: req.session.id})
      .count(function(err, count) {
        /*if(count == 0) {
          res.render('users/new', {
              title: 'Type your name'
            , user: new User()
          });
        } else {*/
          respond_with_rooms();
        //}
      });

    var respond_with_rooms = function() {
      Room
      .find()
      .desc('name')
      .run(function(err, rooms) {
        if(err) throw err;
        //console.log(req);
        if(req.is('application/json')) {
          res.json({rooms: rooms});
        } else {
          res.render('rooms/index', {
            title: 'List of Rooms',
            rooms: rooms
          });
        }
      });
    }
  });
};