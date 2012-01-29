exports = mongoose = require('mongoose');
mongo_url = process.env.MONGOHQ_URL || 'mongodb:localhost/cards';
mongoose.connect(mongo_url);
exports = Schema = mongoose.Schema;