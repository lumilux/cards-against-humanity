var Room = mongoose.model('Room');
var User = mongoose.model('User');

var pubnub = require('pubnub');

var network = pubnub.init({
    publish_key   : "pub-1f2d2adc-d1d2-49bc-8394-c96c55faecc8",
    subscribe_key : "sub-687f0559-4a45-11e1-91da-85f515a90a37",
    ssl           : false,
    origin        : 'cardsagain.st'
});

module.exports = function(app) {
  app.get('/room/example', function(req, res) {
    res.render('example', {title: ""});
  });

  app.post('/rooms', function(req, res) {
    var room = new Room(req.body.room);
    room.save(function(err) {
      if(err) {
        res.render('rooms/new', {
          title: 'New Room - error',
          room: room
        });
      } else {
        res.redirect('/room/'+room._id);
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
    console.log("PUT received");
    var room_id = req.body.id;
		console.log("room_id: " + room_id);
    console.log("session: "+req.session.id);
		// console.log(express.bodyParser());
    //res.send("hello", 200);
    User
      .findOne({cookie_id: req.session.id})
      .run(function(err, user) {
        if(err) console.log("couldn't find user with session id "+req.session.id);
        if(!user) {
          res.render('users/new', {
              title: 'Type your name'
            , user: new User()
          });
        } else {
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

  app.put('/room/start', function(req, res) {
    console.log("start received");
		var room_id = req.body.room_id;
    var channel_name = "room:"+room_id;
		var player_id = req.body.player_id;
    var emit = function(request, recipients, body) {
      console.log("emit: "+request+" "+recipients);
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

    //start game
    var start_game = function(players) {
      console.log("in start_game");
      players = fisherYates(players);
      console.log("random shuffled the players. "+players);

      //TODO: something is wrong with this subscribe call.
      //Unexpected token ILLEGAL in the room name?!
      network.subscribe({
        channel: "room:"+room_id,
        connect: function() {
          console.log("subscribed to room:"+room_id);
          setTimeout(function() {
            emit("room ready", [players], {});
          }, 1000);
        },
        callback: function(msg) {
          console.log("received: "+msg.request+" "+msg.recipients);
          if(msg.recipients && msg.recipients[0] === "—server—") {
            var r = msg.request;
            if(r === "timeout ping") {
              console.log("timeout ping received");
              if(msg.body.t_id !== null && msg.body.t_id !== "undefined") {
                console.log("timeout cancelled: "+msg.body.id);
                clearTimeout(msg.body.t_id);
              }
              setTimeout(function () {
                console.log("timeout set");
                var t_id = setTimeout(function() {
                  Room
                    .findById(room_id)
                    .update({"$pull": {players: msg.body.id}},
                      function(err, room) {
                        console.log("timed out: "+msg.body.id);
                      }
                  );
                }, 60000);
                emit("timeout ping", [msg.body.id], {t_id: t_id});
              }, 60000);
            }
            else if(r === "draw card") {
              if(msg.body.color === "white") {
                var chosen_card_text = "";
                Room
                  .findById(room_id, function(err, room){
                    var chosen_card_id = room.white_cards[0];
                    Card.findById(chosen_card_id, function(err, card) {
                      //TODO: handle err (ran out of cards)
                      chosen_card_text = card.text;
                    });
                    emit("new card", [player_id], 
                      {color: "white", content: chosen_card_text});
                  });
                Room
                  .update({_id: room_id},
                    {"$pop": {white_cards: -1}},
                    function(err, room) {});
              }
              else if(msg.body.color === "black") {
                var chosen_card_text = "";
                Room
                  .findById(room_id, function(err, room){
                    var chosen_card_id = room.black_cards[0];
                    Card.findById(chosen_card_id, function(err, card) {
                      //TODO: handle err (ran out of cards)
                      chosen_card_text = card.text;
                    });
                    emit("new card", [player_id], 
                      {color: "black", content: chosen_card_text});
                  });
                Room
                  .update({_id: room_id},
                    {"$pop": {black_cards: -1}},
                    function(err, room) {});
              }
            }
          }
        }
      });
    };

    // add player to ready_players.
    console.log("add player to ready_players");
    Room
      .findById(room_id, function(err, room) {
        if(!room)
          return next(new Error("could not load room"));
        
        console.log("addToSet happened "+room_id);
        console.log("player_id: "+player_id);
        if(err) {
          console.log("error: addToSet "+room_id);
          console.log(room);
        } else {
          //if all players are ready, start game
          console.log("error: "+err);
          console.log("room: "+room);
          console.log("room.players: "+room.players);
          console.log("room.ready_players: "+room.ready_players);
          room.ready_players.push(player_id);

          room.save(function(err) {
            if(err)
              console.log("could not save room");
            else {
              console.log("saved room!");
              if(setEquals(room.players, room.ready_players)) {
                start_game(room.ready_players);
              } else {
                console.log("everyone is not ready.");
                console.log("players: "+room.players);
                console.log("ready_players: "+room.ready_players);
              }
            }
          });
        }
      });

    res.json(null, 200);
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