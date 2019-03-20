const mongoose = require("mongoose");

const User = mongoose.model("User", {
  name: String,
  token: String,
  idFacebook: String,
  pictures: String
});

module.exports = User;
