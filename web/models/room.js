var RoomSchema = new Schema({
	title:   {type: String, default: 'A room', trim: true}
  , players: [User]
  , black_cards: [Card]
  , white_cards: [Card]
});

mongoose.model('Room', RoomSchema);