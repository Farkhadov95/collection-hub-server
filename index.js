require('dotenv').config();
const { request } = require('urllib');
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

const MONGODB_DATABASE = 'CollectionsDB'
const MONGODB_COLLECTION = 'Collections'
const ATLAS_API_BASE_URL = 'https://cloud.mongodb.com/api/atlas/v1.0';
const ATLAS_PROJECT_ID = process.env.MONGODB_ATLAS_PROJECT_ID;
const ATLAS_CLUSTER_NAME = process.env.MONGODB_ATLAS_CLUSTER;
const ATLAS_CLUSTER_API_URL = `${ATLAS_API_BASE_URL}/groups/${ATLAS_PROJECT_ID}/clusters/${ATLAS_CLUSTER_NAME}`;
const ATLAS_SEARCH_INDEX_API_URL = `${ATLAS_CLUSTER_API_URL}/fts/indexes`;

const ATLAS_API_PUBLIC_KEY = process.env.MONGODB_ATLAS_PUBLIC_KEY;
const ATLAS_API_PRIVATE_KEY = process.env.MONGODB_ATLAS_PRIVATE_KEY;
const DIGEST_AUTH = `${ATLAS_API_PUBLIC_KEY}:${ATLAS_API_PRIVATE_KEY}`;

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

const findIndexByName = async (indexName) => {
    const allIndexesResponse = await request(
        `${ATLAS_SEARCH_INDEX_API_URL}/${MONGODB_DATABASE}/${MONGODB_COLLECTION}`,
        {
            dataType: 'json',
            contentType: 'application/json',
            method: 'GET',
            digestAuth: DIGEST_AUTH,
        }
    )
    return (allIndexesResponse.data).find((i) => i.name === indexName)
}

const upsertSeachIndex = async () => {
    const userSearchIndex = await findIndexByName('collection_search');
    if (!userSearchIndex) {
        await request(ATLAS_SEARCH_INDEX_API_URL, {
            data: {
                database: MONGODB_DATABASE,
                collectionName: MONGODB_COLLECTION,
                name: 'collection_search',
                mapping: {
                    dynamic: true,
                },
            },
            dataType: 'json',
            contentType: 'application/json',
            method: 'POST',
            digestAuth: DIGEST_AUTH
        })
    }
}

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB...');
        await upsertSeachIndex();
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



app.get('/search', async (req, res) => { })
app.get('/autocomplete', async (req, res) => { })

server.listen(port, () => console.log(`Server is running on port ${port}`));

