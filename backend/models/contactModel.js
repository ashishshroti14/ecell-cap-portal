const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  subject: { type: String },
  message: { type: String },
  creationTime: { type: Number, default: Date.now },
  lastUpdated: { type: Number, default: Date.now },
});

contactSchema.pre("save", function save(next) {
  const user = this;
  user.lastUpdated = Date.now();
  next();
});

contactSchema.pre("updateOne", function updateOne(next) {
  const user = this;
  user.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model("contactMessages", contactSchema);
