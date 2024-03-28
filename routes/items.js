const express = require("express");
const jwt = require('jsonwebtoken');
const config = require('config');
const router = express.Router();
const Item = require("../models/item");
const itemOwner = require("../middleware/itemOwner");
const auth = require("../middleware/auth");
const Comment = require("../models/comment");

const createItem = async (item) => {
    const newItem = new Item(item);
    const result = await newItem.save();
    return result;
}

router.get("/:id", async (req, res) => {
    const item = await Item.findById(req.params.id);
    res.send(item);
})

//get all items
router.get("/", async (req, res) => {
    const items = await Item.find();
    res.send(items);
})

router.get('/popular', async (req, res) => {
    res.json('Success');
});


//get items by collectionID
router.get("/collection/:collectionID", async (req, res) => {
    const collectionID = req.params.collectionID;
    const items = await Item.find({ collectionID });
    res.send(items);
})

router.put("/like/:id", auth, async (req, res) => {
    try {
        const itemId = req.params.id;
        const token = req.header('X-Auth-Token');
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        const decodedUserID = decoded._id;

        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ error: "Item not found" });
        }
        if (item.likeIDs.includes(decodedUserID)) {
            item.likeIDs = item.likeIDs.filter(id => id.toString() !== decodedUserID.toString());
        } else {
            item.likeIDs.push(decodedUserID);
        }
        const updatedItem = await item.save();
        res.json(updatedItem);
    } catch (error) {
        console.error("Error updating item likes:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//update item (edit)
router.put("/:id", itemOwner, async (req, res) => {
    const item = req.body;
    const result = await Item.findByIdAndUpdate(req.params.id, item, { new: true });
    res.send(result);
})

//create new item
router.post("/", auth, async (req, res) => {
    const item = req.body;
    const result = await createItem(item);
    res.send(result);
})

//delete item
router.delete("/:id", itemOwner, async (req, res) => {
    const result = await Item.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ itemID: req.params.id });
    res.send(result);
})

module.exports = router;
