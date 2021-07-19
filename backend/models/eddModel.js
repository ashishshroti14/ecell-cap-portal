const mongoose = require("mongoose");

const eddPortalSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  collegeName: {
    type: String,
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  submissions: {
    type: Array,
    default: [],
  },
  creationTime: {
    type: Number,
    default: Date.now(),
  },
  lastUpdated: {
    type: Number,
    default: Date.now,
  },
});

eddPortalSchema.pre("save", function save(next) {
  const user = this;
  user.lastUpdated = Date.now();
  next();
});

eddPortalSchema.pre("updateOne", function updateOne(next) {
  const user = this;
  user.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model("eddPortal", eddPortalSchema);
