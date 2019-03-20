const mongoose = require("mongoose");

const Task = mongoose.model("Task", {
  name: String,
  status: String,
  startDate: String,
  endDate: String,
  who: Object
});

module.exports = Task;
