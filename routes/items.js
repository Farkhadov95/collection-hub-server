const express = require("express");
const router = express.Router();
const Item = require("../models/item");

const createItem = async (item) => {
    const newItem = new Item(item);
    const result = await newItem.save();
    return result;
}

//get items by collectionID
router.get("/:collectionID", async (req, res) => {
    const collectionID = req.params.collectionID;
    const items = await Item.find({ collectionID });
    res.send(items);
})

//create new item
router.post("/", async (req, res) => {
    const item = req.body;
    const result = await createItem(item);
    res.send(result);
})

module.exports = router;
