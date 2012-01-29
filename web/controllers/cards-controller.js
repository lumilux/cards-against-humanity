var Card = mongoose.model('Card');

module.exports = function(app) {
	app.param('cardid', function(req, res, next, id) {
    Card
      .findOne({_id: id})
      .run(function (err, card) {
        if (err) return next(err);
        if (!user) return next(new Error('Failed to load Card ' + id));
        req.card = card;
        next();
      });
  });
  
	// show user profile
	app.get('/user/:cardid', function(req, res) {
		var card = req.card;
		res.send(card.text);
	});
};