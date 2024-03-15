const Collection = require("../models/collection");
const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = async function (req, res, next) {
    const collectionID = req.params.id;
    const token = req.header('X-Auth-Token');

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        const decodedUserID = decoded._id;
        const decodedIsAdmin = decoded.isAdmin;
        req.user = decoded;

        const collection = await Collection.findById(collectionID);

        if (!collection) return res.status(404).send('Collection not found');
        if (collection.userID !== decodedUserID || !decodedIsAdmin) return res.status(403).send('Access denied: Not the owner');

        next();
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
}
