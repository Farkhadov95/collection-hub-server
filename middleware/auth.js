const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function auth(req, res, next) {
    const token = req.header('X-Auth-Token');
    if (token) next();
    else res.status(403).send('Access denied. User is not authorized.');
};
