const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userID: String,
    content: String,
    date: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
