var UserSchema = new Schema({
		name: String
  , cookie_id: String
  , black_cards: [Card.ObjectId]
});

var User = mongoose.model('User', UserSchema);