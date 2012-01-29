var Card = mongoose.model('Card');

Card
	.count()
	.run(function (err, count) {
		if(count < 50) {
			var Lazy = require('lazy')
				, fs = require('fs');
			new Lazy(fs.createReadStream('./web/black'))
				.lines
				.forEach(function(line) {
					var s_line = line.toString().replace(/'/g,'&#039;');
					var card = new Card({
						  text: s_line
					  , color: 'black'
					});
					card.save(function(err) {
						console.log("SAVED BLACK: "+s_line);
					});
				});
			
			new Lazy(fs.createReadStream('./web/white'))
				.lines
				.forEach(function(line) {
					var s_line = line.toString().replace(/'/g,'&#039;');
					var card = new Card({
						  text: s_line
						, color: 'white'
					});
					card.save(function(err) {
						console.log("SAVED WHITE: "+s_line);
					});
				});
		}
});
