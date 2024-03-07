const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const collections = require("./routes/collections");
const items = require("./routes/items");

const Comments = new mongoose.Schema({
    userID: String,
    content: String,
    date: { type: Date, default: Date.now }
});

mongoose.connect('mongodb://localhost/playground')
    .then(() => console.log('Connected to MongoDB...'))
    .catch((error) => console.error('Could not connect to MongoDB...', error));


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));
app.use("/collections", collections);
app.use("/items", items);

app.listen(port, () => console.log(`Server is running on port ${port}`));
