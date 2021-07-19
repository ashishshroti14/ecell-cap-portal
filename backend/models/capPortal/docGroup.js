const mongoose = require("mongoose");

const docGroup = new mongoose.Schema({
    ambassadorId: { type: mongoose.SchemaTypes.ObjectId },
    taskId: { type: mongoose.SchemaTypes.ObjectId },
    avenue: { type: String },
    urls: [{ type: String }],

    creationTime: { type: Number, default: Date.now() },
    lastUpdated: { type: Number, default: Date.now() },
});

docGroup.pre("save", function save(next) {
    const docGroup = this;
    docGroup.lastUpdated = Date.now();
    next();
});

docGroup.pre("updateOne", function updateOne(next) {
    const docGroup = this;
    docGroup.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("docGroups", docGroup);
