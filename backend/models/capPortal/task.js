const mongoose = require("mongoose");
const ambassador = require("./ambassador");

const capTask = new mongoose.Schema({
    taskName: { type: String },
    ambassadorIds: [{ type: String }],
    creationTime: { type: Number, default: Date.now() },
    lastUpdated: { type: Number, default: Date.now() },
    active: { type: Boolean },
});

capTask.pre("save", function save(next) {
    const task = this;
    task.lastUpdated = Date.now();
    next();
});

capTask.pre("updateOne", function updateOne(next) {
    const task = this;
    task.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("capTasks", capTask);
