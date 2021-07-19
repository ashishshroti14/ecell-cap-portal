const mongoose = require("mongoose");

const docCount = new mongoose.Schema({
    ambassadorId: { type: mongoose.SchemaTypes.ObjectId },
    taskId: { type: mongoose.SchemaTypes.ObjectId },
    avenues: [{ type: String }],
    numOfDocs: { type: Number },

    creationTime: { type: Number, default: Date.now() },
    lastUpdated: { type: Number, default: Date.now() },
});

docCount.pre("save", function save(next) {
    const docCount = this;
    docCount.lastUpdated = Date.now();
    next();
});

docCount.pre("updateOne", function updateOne(next) {
    const docCount = this;
    docCount.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("docCounts", docCount);
