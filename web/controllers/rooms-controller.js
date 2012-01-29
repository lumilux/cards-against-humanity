var Room = mongoose.model('Room');
var User = mongoose.model('User');

module.exports = function(app) {
  app.put('/rooms/new', function(req, res) {
    var room = new Room(req.body.room);
    //get session id of user
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
      .findOne({_id: id})
      .run(function (err, room) {
        if (err) return next(err);
        if (!room) return next(new Error('Failed to load Room ' + id));
        req.room = room;
        next();
      });
  });

  var show_room = function(req, res, after) {
    var r_room = req.room;
    Room
      .findOne({_id: r_room._id})
      .run(function(err, room) {
        var players = [];
        User
          .find({cookie_id: {$in: room.players}},
          function(err, users) {
            var players = [];
            users
              .forEach(function(user) {
                players.push(user);
            });
            after(room, players);
          });
      });
  };
  app.get('/room/:id', function(req, res) {
    show_room(req, res, function(room, players) {
      res.render('rooms/show', {
        title: 'Room',
        room: room,
        players: players
      });
    });
  });
  app.get('/room/:id/players.json', function(req, res) {
    show_room(req, res, function(room, players) {
      res.send(players);
    });
  });

  app.get('/room/:id/join', function(req, res, next) {
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
        } else {
          console.log("user: "+user);
          var uid = user.cookie_id;
          Room
            .update({_id: req.room._id},
              {$push: {players: uid}}
            );
          console.log("updated players");
          console.log("room: "+req.room);
          res.redirect('/room/'+req.room._id);
        }
      });
  });

  app.get('/room/:id/leave', function(req, res) {
    console.log("FINE THEN. LEAVE ME.");
    console.log(req.session.id);
    var room = req.room;
    Room
      .update({players: req.session.id},
        {$pull: {players: req.session.id}}
      );
    res.redirect('/rooms');
  });

  // list available rooms
  app.get('/rooms', function(req, res) {
    Room
    .find()
    .desc('name')
    .run(function(err, rooms) {
      if(err) throw err;
      res.render('rooms/index', {
        title: 'List of Rooms',
        rooms: rooms
      });
    });
  });
};