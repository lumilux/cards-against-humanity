var RoomSchema = new Schema({
		name:   {type: String, default: 'A room', trim: true}
  , players: [User]
  //, black_cards: [Card]
  //, white_cards: [Card]
});

var Room = mongoose.model('Room', RoomSchema);