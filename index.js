import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import express from "express";
import mongoose from 'mongoose';

const collectionSchema = new mongoose.Schema({
    userID: String,
    name: String,
    description: String,
    image: String,
    tags: [String],
    date: { type: Date, default: Date.now }
});

mongoose.connect('mongodb://localhost/playground')
    .then(() => console.log('Connected to MongoDB...'))
    .catch((error) => console.error('Could not connect to MongoDB...', error));

const Collection = mongoose.model('Collection', collectionSchema);

const createCollection = async (collection) => {
    const newCollection = new Collection(collection);
    const result = await newCollection.save();
    console.log(result);
};

const getCollection = async (id) => {
    const collection = await Collection.findById(id);
    console.log(collection);
}

const getAllCollections = async () => {
    const collections = await Collection.find();
    console.log(collections);
}

const test = {
    userID: "test",
    name: "test",
    description: "test",
    image: "test",
    tags: ["test"]
}

createCollection(test);


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));

app.get("/", (req, res) => {
    res.send(test);
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
