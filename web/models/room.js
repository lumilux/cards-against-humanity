var RoomSchema = new Schema({
		name:    {type: String, default: 'A room', trim: true}
	, players: [String] // this is ok because we'll never have more than 6 players
  , black_cards: [Card.ObjectId]
  , white_cards: [Card.ObjectId]
});

var Room = mongoose.model('Room', RoomSchema);