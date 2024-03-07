const mongoose = require('mongoose');

const fieldsDefSchema = new mongoose.Schema({
    fieldName: String,
    fieldType: String
})

const collectionSchema = new mongoose.Schema({
    userID: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: String,
    itemFields: { type: [fieldsDefSchema], default: [] },
    date: { type: Date, default: Date.now },
});

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
