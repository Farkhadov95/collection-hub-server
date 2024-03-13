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

//create new item
router.post("/", auth, async (req, res) => {
    // check if collection id has user id of creator

    const item = req.body;
    const result = await createItem(item);
    res.send(result);
})

module.exports = router;
