const mongoose = require("mongoose");

const Event = mongoose.model("Event", {
  type: String,
  date: String,
  who: Object,
  where: String,
  readers: { type: Array, of: Object },
  deletedTask: String,
  task: { type: mongoose.Schema.Types.ObjectId, ref: "Task" }
});

module.exports = Event;
