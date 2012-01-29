var Room = mongoose.model('Room');

module.exports = function(app) {
	app.get('/room/:room/join', function(req, res) {
    	res.send('1');
    });

	// list available rooms
	app.get('/rooms', function(req, res) {
		Room.find({})
		.desc('title')
		.run(function(err, articles) {
			if(err) throw err;
			res.render('rooms/index', {
				title: 'List of Rooms',
				rooms: rooms
			});
		});
	});

	app.get('/', function(req, res) {
		res.redirect('/rooms');
	});
};