require('dotenv').config();
const { mongoClient, MONGODB_DATABASE, MONGODB_COMMENTS_COLLECTION, MONGODB_ITEMS_COLLECTION, MONGODB_COLLECTION } = require('./utils');
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

app.get('/search/collection', async (req, res) => {
    const searchQuery = req.query.query;

    const database = mongoClient.db(MONGODB_DATABASE);
    const collection = database.collection(MONGODB_COLLECTION);

    const pipeline = [];
    pipeline.push({
        $search: {
            index: "collections_index",
            text: {
                query: searchQuery,
                path: ['name', 'topic', 'description'],
                fuzzy: {},
            }
        }
    });

    pipeline.push({
        $project: {
            _id: 1,
            score: { $meta: 'searchScore' },
            name: 1,
            maxScore: 1,
            normalizedScore: 1
        },
    })

    pipeline.push({
        $setWindowFields: {
            output: {
                maxScore: { $max: "$score" }
            }
        }
    });

    pipeline.push({
        $addFields: {
            normalizedScore: { $divide: ["$score", "$maxScore"] }
        }
    });

    const result = await collection.aggregate(pipeline).sort({ score: -1 }).limit(10);
    const array = await result.toArray();
    res.send(array);
});

app.get('/search/item', async (req, res) => {
    const searchQuery = req.query.query;

    const database = mongoClient.db(MONGODB_DATABASE);
    const collection = database.collection(MONGODB_ITEMS_COLLECTION);

    const pipeline = [];
    pipeline.push({
        $search: {
            index: "items_index",
            text: {
                query: searchQuery,
                path: ['name', 'tags', 'description'],
                fuzzy: {},
            }
        }
    });

    pipeline.push({
        $project: {
            _id: 1,
            name: 1,
            score: { $meta: 'searchScore' },
            maxScore: 1,
            normalizedScore: 1
        },
    })

    pipeline.push({
        $setWindowFields: {
            output: {
                maxScore: { $max: "$score" }
            }
        }
    });

    pipeline.push({
        $addFields: {
            normalizedScore: { $divide: ["$score", "$maxScore"] }
        }
    });

    const result = await collection.aggregate(pipeline).sort({ score: -1 }).limit(10);
    const array = await result.toArray();
    res.send(array);
});

app.get('/search/comment', async (req, res) => {
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
            _id: 1,
            score: { $meta: 'searchScore' },
            userID: 1,
            itemID: 1,
            collectionID: 1,
            username: 1,
            comment: 1,
            createdAt: 1,
            updatedAt: 1,
            maxScore: 1,
            normalizedScore: 1
        },
    })

    pipeline.push({
        $setWindowFields: {
            output: {
                maxScore: { $max: "$score" }
            }
        }
    });

    pipeline.push({
        $addFields: {
            normalizedScore: { $divide: ["$score", "$maxScore"] }
        }
    });

    const result = await collection.aggregate(pipeline).sort({ score: -1 }).limit(10);
    const array = await result.toArray();
    res.send(array);
});

server.listen(port, () => console.log(`Server is running on port ${port}`))
