const auth = require("../middleware/auth");
const express = require("express");
const router = express.Router();
const Item = require("../models/item");

const createItem = async (item) => {
    const newItem = new Item(item);
    const result = await newItem.save();
    return result;
}

//get all items
router.get("/", async (req, res) => {
    const items = await Item.find();
    res.send(items);
})

//get items by collectionID
router.get("/:collectionID", async (req, res) => {
    const collectionID = req.params.collectionID;
    const items = await Item.find({ collectionID });
    res.send(items);
})

//update item 
router.put("/:id", auth, async (req, res) => {
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
router.delete("/:id", auth, async (req, res) => {
    const result = await Item.findByIdAndDelete(req.params.id);
    res.send(result);
})

module.exports = router;
