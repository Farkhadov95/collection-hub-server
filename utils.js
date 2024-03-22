const mongodb = require('mongodb');

const MONGODB_DATABASE = 'test'
const MONGODB_COLLECTION = 'collections'
const MONGODB_ITEMS_COLLECTION = 'items'
const MONGODB_COMMENTS_COLLECTION = 'comments'

const MONGODB_HOST = process.env.MONGODB_URI;
const MONGODB_USER = process.env.MONGODB_USER
const MONGODB_PASS = process.env.MONGODB_PASSWORD

const mongoClient = new mongodb.MongoClient(MONGODB_HOST, {
    auth: { username: MONGODB_USER, password: MONGODB_PASS },
})

module.exports = { MONGODB_COLLECTION, MONGODB_DATABASE, mongoClient, MONGODB_ITEMS_COLLECTION, MONGODB_COMMENTS_COLLECTION };
