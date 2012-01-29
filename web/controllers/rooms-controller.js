var Room = mongoose.model('Room');

module.exports = function(app) {
  app.put('/rooms/new', function(req, res) {
    var room = new Room(req.body.room);
    //get session id of user
    room.save(function(err) {
      if(err) {
        utils.mongooseErrorHandler(err, req);
        res.render('rooms/new', {
          title: 'New Room',
          room: room
        });
      } else {
        req.flash('notice', 'Room created successfully');
        res.redirect('/room/'+room._id);
      }
    });
  });

  app.get('/rooms/new', function(req, res) {
    res.render('rooms/new', {
      title: 'New Room',
      room: new Room({})
    });
  });

  app.param('roomid', function(req, res, next, id) {
    Room
      .findOne({_id: id})
      .run(function (err, room) {
        if (err) return next(err);
        if (!room) return next(new Error('Failed to load Room ' + id));
        req.foundRoom = room;
        next();
      });
  });

  app.put('/room/:roomid/join', function(req, res) {
    res.send('1');
  });

  app.get('/room/:roomid', function(req, res) {
    res.render('rooms/show', {
      title: req.room.name,
      players: req.room.players
    });
  });

  // list available rooms
  app.get('/rooms', function(req, res) {
    Room.find({})
    .desc('title')
    .run(function(err, rooms) {
      if(err) throw err;
      res.render('rooms/index', {
        title: 'List of Rooms',
        rooms: rooms
      });
    });
  });

  app.get('/', function(req, res) {
    res.send('Hello world');
    //res.redirect('/rooms');
  });
};