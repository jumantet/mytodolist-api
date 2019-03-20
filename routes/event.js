const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const Task = require("../models/task");
const Event = require("../models/event");

const format = require("date-fns/format");

//READ

router.get("/events", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("task")
      .sort({ date: -1 });
    res.json({ events });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post("/events/read", isAuthenticated, async (req, res) => {
  try {
    const events = await Event.find();
    events.map(async event => {
      const found = event.readers.find(x => {
        return x.name === req.user.name;
      });
      if (!found) {
        event.readers.push(req.user);
        await event.save();
      }
    });

    res.json(events);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

//RAFRAICHIR HISTORIC

router.post("/refresh/historic", async (res, req) => {
  try {
    await Event.deleteMany({});
    res.json("The historic has been refreshed");
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
