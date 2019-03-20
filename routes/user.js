const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const isAuthenticated = require("../middlewares/isAuthenticated");

const User = require("../models/user");

//CREATE A USER

router.post("/user/login", async (req, res) => {
  try {
    const user = await User.findOne({ idFacebook: req.body.idFacebook });

    if (!user) {
      const token = uid2(16);
      const newUser = new User({
        name: req.body.name,
        token: token,
        idFacebook: req.body.idFacebook,
        pictures: req.body.pictures,
        created: new Date()
      });
      await newUser.save();
      res.json(newUser);
    } else {
      res.json(user);
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

// GET ALL THE USER

router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
module.exports = router;
