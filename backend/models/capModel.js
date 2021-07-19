const mongoose = require("mongoose");

const capSchema = new mongoose.Schema({
    Email: { type: String, unique: true },
    Name: { type: String },
    Phone: { type: String, unique: true },
    prefix: { type: Number },
    CollegeName: { type: String },
    City: { type: String },
    Skills: { type: String },
    Experience: { type: String },
    Qualification: { type: String },
    Why_Ecell: { type: String },
    What_make_you_join_CAP: { type: String },

    creationTime: { type: Number, default: Date.now },
    lastUpdated: { type: Number, default: Date.now },
});

capSchema.pre("save", function save(next) {
    const user = this;
    user.lastUpdated = Date.now();
    next();
});

capSchema.pre("updateOne", function updateOne(next) {
    const user = this;
    user.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("capForms", capSchema);