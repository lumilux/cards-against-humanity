var User = mongoose.model('User');

module.exports = function(app) {
	app.param('profileId', function(req, res, next, id) {
    User
      .findOne({_id: id})
      .run(function (err, user) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load User ' + id));
        req.foundUser = user;
        next();
      });
  });
  
	// show user profile
	app.get('/user/:profileId', function(req, res) {
		var user = req.foundUser;
		res.render('users/profile', {
			black_cards: user.black_cards
		});
	});
};