const mongoose = require("mongoose");


const capAmbassador = new mongoose.Schema({

    email: { type: String, unique: true },
    name: { type: String },
    points: { type: Number, min: 0 },
    collegeName: { type: String },
    password: { type: String },
    avatarURL: { type: String },
    creationTime: { type: Number, default: Date.now },
    lastUpdated: { type: Number, default: Date.now },


});



capAmbassador.pre("save", function save(next) {
    const ambassador = this;
    ambassador.lastUpdated = Date.now();
    next();
});

capAmbassador.pre("updateOne", function updateOne(next) {
    const ambassador = this;
    ambassador.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("capAmbassadors", capAmbassador);