const mongoose = require('mongoose');

const fieldsExeSchema = new mongoose.Schema({
    fieldName: String,
    fieldValue: String
})

const ItemSchema = new mongoose.Schema({
    collectionID: { type: String, required: true, index: true },
    userID: { type: String, required: true, index: true },
    name: { type: String, required: true },
    tags: { type: String, required: true },
    description: { type: String, required: true },
    fields: { type: [fieldsExeSchema], default: [] },
    image: String,
    likeIDs: [String],
    date: { type: Date, default: Date.now }
}, { timestamps: true });

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
