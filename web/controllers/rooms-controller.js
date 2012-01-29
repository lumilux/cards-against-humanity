var Room = mongoose.model('Room');

module.exports = function(app) {
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

	app.get('/room/:roomid/join', function(req, res) {
    res.send('1');
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