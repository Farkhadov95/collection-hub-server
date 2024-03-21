require('dotenv').config();
const config = require("config");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const collections = require("./routes/collections");
const items = require("./routes/items");
const users = require("./routes/users");
const auth = require("./routes/auth");
const comments = require("./routes/comments");

const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socketIo = require("socket.io");
const bodyParser = require('body-parser');

const Collection = require('./models/collection');
const Item = require('./models/item');
const Comment = require('./models/comment');

const io = socketIo(server, {
    pingTimeout: 60000,
    cors: {
        origin: "*"
    }
});

const port = process.env.PORT || 3000;

if (!config.get("jwtPrivateKey")) {
    console.error("FATAL ERROR: jwtPrivateKey is not defined.");
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB...');
        await Collection.createIndexes({ name: 'text' });
        await Item.createIndexes({ name: 'text', tags: 'text' });
        await Comment.createIndexes({ comment: 'text' });
    })
    .catch((error) => console.error('Could not connect to MongoDB...', error));

app.use(bodyParser.json({ extended: true, limit: '1000kb' }));
app.use(bodyParser.text({ limit: '1000kb' }));
app.use(express.static("public"));

app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));
app.use("/collections", collections);
app.use("/items", items);
app.use("/users", users);
app.use("/auth", auth);
app.use("/comments", comments(io));


io.on("connection", (socket) => {
    console.log("a user connected");
    socket.on("newComment", ({ comment }) => {
        socket.broadcast.emit("newComment", { comment });
        console.log(comment);
    })
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
})

const searchInDatabase = async (searchText) => {
    const collectionsResults = await Collection.find({ $text: { $search: searchText } });
    const itemsResults = await Item.find({ $text: { $search: searchText } });
    const commentsResults = await Comment.find({ $text: { $search: searchText } });

    const combinedResults = { collections: collectionsResults, items: itemsResults, comments: commentsResults };
    console.log('combinedResults', combinedResults);
    return combinedResults;
}

app.get('/search', async (req, res) => {
    const searchText = req.query.query;
    console.log("searchText", searchText)
    try {
        const searchResults = await searchInDatabase(searchText);
        res.json(searchResults);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

server.listen(port, () => console.log(`Server is running on port ${port}`));

