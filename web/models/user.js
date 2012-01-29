var UserSchema = new Schema({
	room_id: Number
  , cookie_id: Number
  //, black_cards: [Card]
});

mongoose.model('User', UserSchema);