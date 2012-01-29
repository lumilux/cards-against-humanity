var UserSchema = new Schema({
		name: String
  , cookie_id: Number
  //, black_cards: [Card]
});

var User = mongoose.model('User', UserSchema);