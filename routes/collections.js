const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const jwt = require("jsonwebtoken");
const config = require("config");
const express = require("express");
const router = express.Router();
const Collection = require("../models/collection");

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
router.get("/my", auth, async (req, res) => {
    const token = req.header('X-Auth-Token');
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    const ID = decoded._id;
    const collections = await Collection.find({ userID: ID });
    res.send(collections);
});

//get specific collection
router.get("/:id", async (req, res) => {
    const collection = await Collection.findById(req.params.id);
    if (!collection) res.status(404).json({ error: 'Collection not found' });
    res.send(collection);
});

// update specific collection
router.put("/:id", auth, async (req, res) => {
    const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!collection) res.status(404).json({ error: 'Collection not found' });
    res.send(collection);
})

//create new collection
router.post("/", auth, async (req, res) => {
    const token = req.header('X-Auth-Token');
    const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
    const ID = decoded._id;

    console.log(ID);

    const collection = {
        userID: ID,
        name: req.body.name,
        topic: req.body.topic,
        description: req.body.description,
        image: req.body.image,
    };

    const result = await createCollection(collection);
    res.send(result);
})

//delete specific collection
router.delete("/:id", auth, async (req, res) => {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) res.status(404).json({ error: 'Collection not found' });
    res.send(collection);
})

//delete feature 
router.delete('/:collectionId/:featureId', auth, async (req, res) => {
    try {
        const { collectionId, featureId } = req.params;
        const collection = await Collection.findByIdAndUpdate(
            collectionId,
            { $pull: { itemFields: { _id: featureId } } },
            { new: true }
        );
        if (!collection) res.status(404).json({ error: 'Collection not found' });
        res.status(200).json(collection);
    } catch (error) {
        console.error('Error deleting itemField:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router;
