const jwt = require('jsonwebtoken');
const config = require('config');
const Collection = require("../models/collection");

module.exports = async function (req, res, next) {
    const collectionID = req.params.id;
    const token = req.header('X-Auth-Token');

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        const decodedUserID = decoded._id;
        const decodedIsAdmin = decoded.isAdmin;
        req.user = decoded;

        const foundCollection = await Collection.findById(collectionID);
        if (!foundCollection) return res.status(404).send('Collection is not found');
        if (foundCollection.userID === decodedUserID || decodedIsAdmin) {
            next();
        } else {
            return res.status(403).send('Access denied: Not the owner');
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
}
