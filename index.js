// require('dotenv').config();
// const config = require("config");
// const helmet = require("helmet");
// const morgan = require("morgan");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const collections = require("./routes/collections");
// const items = require("./routes/items");
// const users = require("./routes/users");
// const auth = require("./routes/auth");
// const comments = require("./routes/comments");

// const express = require("express");
// const app = express();
// const port = process.env.PORT || 3000;

// if (!config.get("jwtPrivateKey")) {
//     console.error("FATAL ERROR: jwtPrivateKey is not defined.");
//     process.exit(1);
// }

// mongoose.connect(process.env.MONGODB_URI)
//     .then(() => console.log('Connected to MongoDB...'))
//     .catch((error) => console.error('Could not connect to MongoDB...', error));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public"));

// app.use(cors());
// app.use(helmet());
// app.use(morgan("tiny"));
// app.use("/collections", collections);
// app.use("/items", items);
// app.use("/users", users);
// app.use("/auth", auth);
// app.use("/comments", comments);

// app.listen(port, () => console.log(`Server is running on port ${port}`));

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
const { Server } = require("socket.io");

const io = new Server(server);
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

const port = process.env.PORT || 3000;

if (!config.get("jwtPrivateKey")) {
    console.error("FATAL ERROR: jwtPrivateKey is not defined.");
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB...'))
    .catch((error) => console.error('Could not connect to MongoDB...', error));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(cors());
app.use(helmet());
app.use(morgan("tiny"));
app.use("/collections", collections);
app.use("/items", items);
app.use("/users", users);
app.use("/auth", auth);
app.use("/comments", comments);

server.listen(port, () => console.log(`Server is running on port ${port}`));

