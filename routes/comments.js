const auth = require("../middleware/auth");
const Item = require("../models/item");
const Comment = require("../models/comment");
const express = require("express");
const router = express.Router();

router.get('/:itemID', async (req, res) => {
    const item = await Item.findById(req.params.itemID);
    const commentIDs = item.commentIDs;
    const comments = await Promise.all(commentIDs.map(async (commentID) => {
        const comment = await Comment.findById(commentID);
        return comment;
    }))
    res.send(comments);
})

router.post('/:itemID', auth, async (req, res) => {
    const item = await Item.findById(req.params.itemID);
    const comment = new Comment(req.body);
    item.commentIDs.push(comment._id);
    await comment.save();
    await item.save();
    res.send(comment);
})

module.exports = router;
