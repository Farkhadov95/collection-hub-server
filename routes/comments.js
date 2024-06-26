const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require("../middleware/auth");
const Item = require("../models/item");
const User = require("../models/user");
const Comment = require("../models/comment");
const express = require("express");
const router = express.Router();

module.exports = function (io) {
    router.get('/:itemID', async (req, res) => {
        const itemID = req.params.itemID;
        try {
            const comments = await Comment.find({ itemID: itemID })
            res.send(comments);
        } catch (error) {
            console.error('Error occurred while processing the request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    router.post('/:itemID', auth, async (req, res) => {
        try {
            const token = req.header('X-Auth-Token');
            const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
            const decodedUserID = decoded._id;

            const item = await Item.findById(req.params.itemID);
            const user = await User.findById(decodedUserID);

            const newComment = {
                userID: decodedUserID,
                itemID: item._id,
                collectionID: item.collectionID,
                username: user.username,
                comment: req.body.comment,
            }

            const comment = new Comment(newComment);
            await comment.save();

            io.emit('newComment', comment);
            res.send(comment);
        } catch (error) {
            console.error('Error occurred while processing the request:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    return router;
};
