const mongoose = require('mongoose');

const fieldsDefSchema = new mongoose.Schema({
    fieldName: String,
    fieldType: String
})

const collectionSchema = new mongoose.Schema({
    userID: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    topic: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: String,
    itemFields: { type: [fieldsDefSchema], default: [] },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

const Collection = mongoose.model('Collection', collectionSchema);

module.exports = Collection;
