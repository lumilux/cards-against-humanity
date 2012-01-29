var UserSchema = new Schema({
		name: String
	,	_room_id: Number
  , cookie_id: Number
  //, black_cards: [Card]
});

var User = mongoose.model('User', UserSchema);