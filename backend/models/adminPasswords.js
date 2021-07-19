const mongoose = require("mongoose");

const adminPasswordSchema = new mongoose.Schema({
    event: { type: String, required: true, unique: true },
    verticals: [String],
    password: { type: String, required: true },

    creationTime: { type: Number, default: Date.now },
    lastUpdated: { type: Number, default: Date.now },
});

adminPasswordSchema.pre("save", function save(next) {
    const admin = this;
    admin.lastUpdated = Date.now();
    next();
});

adminPasswordSchema.pre("updateOne", function updateOne(next) {
    const admin = this;
    admin.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("adminPasswords", adminPasswordSchema);
