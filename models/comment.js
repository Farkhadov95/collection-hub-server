const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    userID: { type: String, required: true, index: true },
    itemID: { type: String, required: true, index: true },
    collectionID: { type: String, required: true, index: true },
    username: String,
    comment: String,
    date: { type: Date, default: Date.now }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
