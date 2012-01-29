var RoomSchema = new Schema({
		name:    {type: String, default: 'A room', trim: true}
	, players: [User.ObjectId] // this is ok because we'll never have more than 6 players
  //, black_cards: [Card]
  //, white_cards: [Card]
});

var Room = mongoose.model('Room', RoomSchema);