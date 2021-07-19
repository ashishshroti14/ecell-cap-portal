const mongoose = require("mongoose");

const startupSeriesFormSchema = new mongoose.Schema({
    leaderName: { type: String },
    leaderEmail: { type: String, unique: true },
    leaderRoll: { type: String },
    leaderPhone: { type: String, unique: true },
    leaderYearOfStudy: { type: String },

    numCoFounders: { type: Number },
    coFounderDetails: [{ name: { type: String }, email: { type: String } }],

    startupStage: { type: String },
    startupSector: { type: String },
    startupBusinessModel: { type: String },

    ideathonParticipant: { type: Boolean },
    ideaValidationReportURL: { type: String },
    completedApplicationForm: { type: String },

    notParticipated_problem: { type: String },
    notParticipated_ideaDetails: { type: String },
    notParticipated_potentialCustomers: { type: String },

    expectations: { type: String },

    creationTime: { type: Number, default: Date.now },
    lastUpdated: { type: Number, default: Date.now },
});

startupSeriesFormSchema.pre("save", function save(next) {
    const user = this;
    user.lastUpdated = Date.now();
    next();
});

startupSeriesFormSchema.pre("updateOne", function updateOne(next) {
    const user = this;
    user.lastUpdated = Date.now();
    next();
});

module.exports = mongoose.model("StartupSeriesForms", startupSeriesFormSchema);
