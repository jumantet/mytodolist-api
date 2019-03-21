require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const isAuthenticated = require("./middlewares/isAuthenticated");
const format = require("date-fns/format");
const fr = require("date-fns/locale/fr");

const app = express();
const http = require("http").Server(app);

app.use(cors());

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const io = require("socket.io")(http);
io.on("connection", () => {
  console.log("user connected");
  // client.on("register", handleRegister);
  // client.on("join", handleJoin);
  // client.on("leave", handleLeave);
  // client.on("message", handleMessage);
  // client.on("chatrooms", handleGetChatrooms);
  // client.on("availableUsers", handleGetAvailableUsers);
  // client.on("disconnect", function() {
  //   console.log("client disconnect...", client.id);
  //   handleDisconnect();
  // });
  // client.on("error", function(err) {
  //   console.log("received error from client:", client.id);
  //   console.log(err);

  // });
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true
});

const Message = mongoose.model("Message", {
  who: Object,
  readers: { type: Array, of: Object },
  message: String,
  date: String
});

module.exports = Message;

require("./models/task");
require("./models/event");
require("./models/user");

const taskRoutes = require("./routes/task");
const eventRoutes = require("./routes/event");
const userRoutes = require("./routes/user");

app.use(taskRoutes);
app.use(eventRoutes);
app.use(userRoutes);

app.post("/messages", isAuthenticated, async (req, res) => {
  try {
    const message = new Message({
      who: req.user,
      readers: [req.user],
      message: req.body.message,
      date: format(new Date(), "dddd HH:mm:ss", { locale: fr })
    });
    io.emit("message", req.body.message);
    await message.save();
    res.json(message);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ date: 1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/messages/read", isAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find();
    messages.map(async message => {
      const found = message.readers.find(x => {
        return x.name === req.user.name;
      });
      if (!found) {
        message.readers.push(req.user);
        await message.save();
      }
    });

    res.json(messages);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

http.listen(process.env.PORT, () => {
  console.log("Server has started");
});
