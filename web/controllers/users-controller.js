var User = mongoose.model('User');

module.exports = function(app) {
  app.put('/users/new', function(req, res) {
    var user = new User(req.body.user);
    user.cookie_id = req.session.id;
    user.save(function(err) {
      if(err) {
        res.render('users/new', {
          title: 'User name - error',
          user: user
        });
      } else {
        res.redirect('/rooms');
      }
    });
  });

	app.param('userid', function(req, res, next, id) {
    User
      .findOne({_id: id})
      .run(function (err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        req.user = user;
        next();
      });
  });
  
	// show user profile
	app.get('/user/:userid', function(req, res) {
		var user = req.user;
		res.render('users/profile', {
        name: user.name
			, black_cards: user.black_cards
		});
	});

  app.get('/', function(req, res) {
    User
      .find({cookie_id: req.session.id})
      .count(function(err, count) {
        if(count > 0) {
          res.redirect('/rooms');
        } else {
          res.render('users/new', {
              title: 'Type your name'
            , user: new User()
          });
        }
      });
  });
};