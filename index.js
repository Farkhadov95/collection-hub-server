require('dotenv').config();
const { request } = require('urllib');
const { mongoClient, MONGODB_COLLECTION, MONGODB_DATABASE, MONGODB_COMMENTS_COLLECTION } = require('./utils');
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

const uri = process.env.MONGODB_URI;

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
    .then(async () => console.log('Connected to MongoDB...'))
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

app.get('/search', async (req, res) => {
    const searchQuery = req.query.query;

    const database = mongoClient.db(MONGODB_DATABASE);
    const collection = database.collection(MONGODB_COMMENTS_COLLECTION);

    const pipeline = [];
    pipeline.push({
        $search: {
            index: "comments_index",
            text: {
                query: searchQuery,
                path: ['comment'],
                fuzzy: {},
            }
        }
    });

    pipeline.push({
        $project: {
            _id: 0,
            score: { $meta: 'searchScore' },
            userID: 1,
            itemID: 1,
            collectionID: 1,
            username: 1,
            comment: 1,
            createdAt: 1,
            updatedAt: 1,
        },
    })

    const result = await collection.aggregate(pipeline).sort({ score: -1 }).limit(10);
    const array = await result.toArray();
    res.send(array);
});

app.get('/autocomplete', async (req, res) => { })

server.listen(port, () => console.log(`Server is running on port ${port}`))
