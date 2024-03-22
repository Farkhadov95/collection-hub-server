const express = require("express");
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

//get items by collectionID
router.get("/collection/:collectionID", async (req, res) => {
    const collectionID = req.params.collectionID;
    const items = await Item.find({ collectionID });
    res.send(items);
})

//update item 
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
