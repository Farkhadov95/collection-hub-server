const bcrypt = require("bcrypt");
const _ = require("lodash");
const User = require("../models/user");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send("Invalid email or password");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send("Invalid email or password");

    const token = user.generateAuthToken();
    user.token = token;

    await user.save();
    res.send(_.pick(user, ["_id", "username", "email", "token"]));
});

module.exports = router;
