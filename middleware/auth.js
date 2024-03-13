const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function auth(req, res, next) {
    const token = req.header('X-Auth-Token');
    const userID = req.header('X-User-ID');

    if (!token) return res.status(401).send('Access denied. No token provided.');
    if (!userID) return res.status(400).send("User ID is required.");

    try {
        const decoded = jwt.verify(token, config.get('jwtPrivateKey'));
        const decodedUserID = decoded._id;
        const decodedIsAdmin = decoded.isAdmin;

        req.user = decoded;

        if (decodedIsAdmin || userID === decodedUserID) {
            next();
        } else {
            res.status(403).send('Access denied. User is not authorized.');
        }
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
};
