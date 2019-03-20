const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const isAuthenticated = require("../middlewares/isAuthenticated");

const Task = require("../models/task");
const Event = require("../models/event");

const format = require("date-fns/format");
//CREATE

router.post("/create", isAuthenticated, async (req, res) => {
  try {
    const newTask = new Task({
      name: req.body.name,
      status: "todo",
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      who: req.user
    });

    await newTask.save();
    const task = await Task.findOne({ _id: newTask._id });
    const newEvent = new Event({
      type: "create",
      date: format(new Date(), "DD/MM/YYYY hh:mm:ss"),
      where: req.body.where,
      who: req.user,
      readers: [req.user],
      task: task
    });
    await newEvent.save();
    res.json(task);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
});

//READ

//READ TOUTE LES TASKS
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    const events = await Event.find();
    res.json({ tasks });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//UPDATE
//UPDATE WHEN A TASK IS MOVED

router.post("/update/:id", isAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id });
    if (task) {
      Object.keys(req.body).forEach(key => (task[key] = req.body[key]));
      await task.save();
      const newEvent = new Event({
        type: "update",
        date: format(new Date(), "DD/MM/YYYY hh:mm:ss"),
        where: req.body.where,
        readers: [req.user],
        who: req.user,
        task: task
      });
      await newEvent.save();
      res.json(task);
    } else {
      res.status(400).json({ message: "This task does not exist" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//DELETE

router.post("/delete/:id", isAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id });
    if (task) {
      const newEvent = new Event({
        type: "delete",
        date: format(new Date(), "DD/MM/YYYY hh:mm:ss"),
        who: req.user,
        deletedTask: task.name
      });
      await Task.deleteOne({ _id: req.params.id });
      await Event.deleteMany({
        task: mongoose.Types.ObjectId(req.params.id)
      });
      await newEvent.save();
      res.json({ message: "Task has been deleted" });
    } else {
      res.status(400).json({ message: "This task does not exist" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
