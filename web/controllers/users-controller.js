var User = mongoose.model('User');

module.exports = function(app) {
  app.post('/users', function(req, res) {
    //console.log(req);
    var user = new User(req.body.user);
    user.cookie_id = req.session.id;
    user.save(function(err) {
      if(err) {
        // TODO: handle duplicate name 
        if(req.is('application/json')) {
          res.json("Could not create new user.", 500);
        } else {
          res.render('users/new', {
            title: 'User name - error',
            user: user
          });
        }
      } else {
        if(req.is('application/json')) {
          res.contentType('application/json');
        }
        req.session.username = user.name;
        res.redirect('/rooms');
      }
    });
  });

  app.del('/users', function (req, res) {
    // also remove user from current room?
    User
      .remove({cookie_id: req.session.id})
      .run(function (err, user) {
        req.session.destroy();
        res.redirect('/');
      });
  });

  app.get('/users/new', function(req, res) {
    res.render('users/new', {
      title: 'New User',
      user: new User({})
    });
  });

	app.param('userid', function(req, res, next, id) {
    User
      .findOne({"_id": User.ObjectId(id)})
      .run(function (err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        req.user = user;
        next();
      });
  });
  
	// show user profile
  /*
	app.get('/user/:userid', function(req, res) {
		var user = req.user;
		res.render('users/profile', {
        name: user.name
			, black_cards: user.black_cards
		});
	});
  */

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