var Room = mongoose.model('Room');
var User = mongoose.model('User');

module.exports = function(app) {
  app.post('/rooms', function(req, res) {
    var room = new Room(req.body.room);
    room.save(function(err) {
      if(err) {
        res.render('rooms/new', {
          title: 'New Room - error',
          room: room
        });
      } else {
        res.redirect('/room/'+room._id+'/join');
      }
    });
  });

  app.get('/rooms/new', function(req, res) {
		console.log('ASDFKLJASKDFJA');
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
    var r_room = req.room;
    Room
      .findOne({_id: r_room._id})
      .run(function(err, room) {
        var players = [];
        User
          .find({cookie_id: {"$in": room.players}},
          function(err, users) {
            var players = [];

            users
              .forEach(function(user) {
                players.push(user);
            });

            if(req.is('application/json')) {
              res.json({user: req.session.id, players: players});
            } else {
              res.render('rooms/show', {
                title: 'Room',
                room: room,
                players: players
              });
            }
          });
    });
  });

  app.put('/room/', function(req, res, next) {
		var room_id = req.body.id;
		console.log("room_id: " + room_id);
    console.log("session: "+req.session.id);
		// console.log(express.bodyParser());
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
          if(!user.in_room) {
            Room
              .update({_id: room_id},
                {"$addToSet": {players: uid}},
                function(err) {
                  User
                    .update({_id: uid},
                      {in_room: true},
                      function(err) {}
                    );
                }
              );
            console.log("updated players");
            // console.log("room: "+req.room);
            req.session.room = room_id;
            res.redirect('/room/'+room_id);
          } else {
            res.redirect('/rooms');
          }
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
        function(err) {
          User
            .update({_id: req.session.id},
              {in_room: false},
              function(err) {}
            );
          //TODO: if no one left in room, delete room
        }
      );
    res.redirect('/rooms');
  });

  app.put('/room/start', function(req, res) {
		var room_id = req.body.room_id;
		var player_id = req.body.player_id;
    // add player to ready_players.
    // if everyone is ready, 
    //Room
    //  .find({_id: req.params.id})
  });

  // list available rooms
  app.get('/rooms', function(req, res) {
    Room
    .find()
    .desc('name')
    .run(function(err, rooms) {
      if(err) throw err;
      if(req.is('application/json')) {
        res.json(rooms);
      } else {
        res.render('rooms/index', {
          title: 'List of Rooms',
          rooms: rooms
        });
      }
    });
  });
};