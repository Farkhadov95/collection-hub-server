const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const User = require("../models/user");
const Item = require("../models/item");
const Collection = require("../models/collection");
const express = require("express");
const router = express.Router();

router.get("/me", auth, async (req, res) => {
    const user = await User.findById(req.user._id).select("-password");
    res.send(user);
})

// get all users
router.get("/", [auth, admin], async (req, res) => {
    const users = await User.find().select("-password");
    res.send(users);
});

// change status for users
router.put("/", [auth, admin], async (req, res) => {
    const { users, status } = req.body;
    try {
        const usersToUpdate = await User.find({ _id: { $in: users } }).select("-password");
        usersToUpdate.forEach(async (user) => {
            user.isAdmin = status;
            await user.save();
        });
        res.send(usersToUpdate);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// delete users
router.delete("/", [auth, admin], async (req, res) => {
    const users = req.body;
    try {
        await User.deleteMany({ _id: { $in: users } });
        await Item.deleteMany({ userID: { $in: users } });
        await Collection.deleteMany({ userID: { $in: users } });
        res.send('Users deleted successfully!');
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

//register new user
router.post("/", async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered");

    user = new User(_.pick(req.body, ["username", "email", "password"]));
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    const token = user.generateAuthToken();
    user.token = token;

    await user.save();
    res.send(_.pick(user, ["_id", "username", "email", "isAdmin", "token"]));
});

router.put("/demo/me", async (req, res) => {
    const { userID, status } = req.body;
    try {
        const userToUpdate = await User.findById(userID);
        userToUpdate.forEach(async (user) => {
            user.isAdmin = status;
            await user.save();
        });
        res.send(userToUpdate);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;
