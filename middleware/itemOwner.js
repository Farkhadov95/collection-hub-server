const jwt = require('jsonwebtoken');
const config = require('config');
const Item = require("../models/item");

module.exports = async function (req, res, next) {
    const id = req.params.id;
    const token = req.header('X-Auth-Token');

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        const decodedUserID = decoded._id;
        const decodedIsAdmin = decoded.isAdmin;
        req.user = decoded;

        const foundItem = await Item.findById({ _id: id });

        if (!foundItem) return res.status(404).send('Item is not found');
        if (foundItem.userID === decodedUserID || decodedIsAdmin) {
            next();
        } else {
            return res.status(403).send('Access denied: Not the owner');
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
}
