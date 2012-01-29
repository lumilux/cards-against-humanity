var CardSchema = new Schema({
		text: String
	, color: String
});

var Card = mongoose.model('Card', CardSchema);