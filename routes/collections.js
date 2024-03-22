const auth = require("../middleware/auth");
const jwt = require('jsonwebtoken');
const config = require('config');
const express = require("express");
const router = express.Router();
const Collection = require("../models/collection");
const User = require("../models/user");
const Item = require("../models/item");
const collectionOwner = require("../middleware/collectionOwner");

const createCollection = async (collection) => {
    const newCollection = new Collection(collection);
    const result = await newCollection.save();
    return result;
};

//get all collections
router.get("/", async (req, res) => {
    const collections = await Collection.find();
    res.send(collections);
})

//get user collections 
router.get("/my/", auth, async (req, res) => {
    const token = req.header('X-Auth-Token');
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    const decodedUserID = decoded._id;

    const collections = await Collection.find({ userID: decodedUserID });
    res.send(collections);
});

//get specific collection
router.get("/:id", async (req, res) => {
    const collection = await Collection.findById(req.params.id);
    if (!collection) res.status(404).json({ error: 'Collection not found' });
    res.send(collection);
});

// update specific collection (optional fields)
router.put("/:id", collectionOwner, async (req, res) => {
    const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!collection) res.status(404).json({ error: 'Collection not found' });
    res.send(collection);
})

//create new collection
router.post("/", auth, async (req, res) => {
    const token = req.header('X-Auth-Token');
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    const decodedUserID = decoded._id;

    const user = await User.findById(decodedUserID);
    const username = user.username;

    const collection = {
        userID: decodedUserID,
        userName: username,
        name: req.body.name,
        topic: req.body.topic,
        description: req.body.description,
        image: req.body.image,
    };

    const result = await createCollection(collection);
    res.send(result);
})

//delete specific collection
router.delete("/:id", collectionOwner, async (req, res) => {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    await Item.deleteMany({ collectionID: req.params.id });
    res.send(collection);
})

//delete collection feature 
router.delete('/:id/:featureId', collectionOwner, async (req, res) => {
    try {
        const { id, featureId } = req.params;
        const collection = await Collection.findByIdAndUpdate(
            id,
            { $pull: { itemFields: { _id: featureId } } },
            { new: true }
        );
        if (!collection) return res.status(404).json({ error: 'Collection not found' });

        await Item.updateMany(
            { collectionID: id },
            { $pull: { fields: { _id: featureId } } }
        )
        return res.status(200).json(collection);
    } catch (error) {
        console.error('Error deleting itemField:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
