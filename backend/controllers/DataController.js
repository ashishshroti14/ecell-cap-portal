const DBUtils = require("../utils/DBUtils")();
const ResponseUtils = require("../utils/ResponseUtils");
const Contact = require("../models/contactModel");
const StartupSeriesForm = require("../models/startupSeriesRegisterModel");
const capForm= require("../models/capModel");

//Route for storing contact messages
exports.contactForm = async (req, res) => {
    let { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        res.redirect("/home");
    }
    try {
        let contact = new Contact({
            name,
            email,
            subject,
            message,
        });
        await DBUtils.saveEntity(contact);
    } catch (e) {
        console.error("Error in storing message: ", e);
        res.redirect("/home");
    }
    res.redirect("/home");
};

//Route to find message based on input start Date and end Date
//Note that the dates are to be provided in MM/dd/YYYY format
exports.getContactMessageInfo = async (req, res) => {
    let { startTime, endTime } = req.body;
    var data = {};
    if (!startTime || !endTime) {
        return ResponseUtils.process400(res, "Request made in incomplete.Please check the request body");
    }
    try {
        let startTimeUnix = Date.parse(startTime);
        let endTimeUnix = Date.parse(endTime);
        data.startTime = new Date(startTimeUnix);
        data.endTime = new Date(endTimeUnix);
        data.messages = await DBUtils.getAllEntities(Contact, {
            creationTime: { $gt: startTimeUnix, $lt: endTimeUnix },
        });
    } catch (e) {
        console.error("Error in finding messages: ", e);
        return ResponseUtils.process500(res, "Please check the date entered.It should be of the format MM/dd/YYYY");
    }
    return ResponseUtils.processData(res, data);
};

//For startup series registration form
exports.uploadToDB = async (reqBody) => {
    try {
        let docToSave = { ...reqBody };

        //Check if user has entered any co-founder details, if not, delete the property
        if (docToSave.coFounderDetails === undefined) {
            docToSave.numCoFounders = 0;
            delete docToSave.coFounderDetails;
        } else {
            docToSave.coFounderDetails = JSON.parse(reqBody.coFounderDetails);
            docToSave.numCoFounders = docToSave.coFounderDetails.length;
        }

        const form = new StartupSeriesForm({
            ...docToSave,
            ideathonParticipant: reqBody.ideathonParticipant === "on" ? true : false,
        });

        await DBUtils.saveEntity(form);
        
        return { success: true, error: null, doc_id: form._id, ideathonParticipant: form.ideathonParticipant};
    } catch (error) {
        return { success: false, error };
    }
};

exports.addFileURLToDB = async (doc_id, ideathonParticipant, fileUrl) => {
    //Check if the user is an ideathon participant and set the uploaded file name accordingly
    try{
        if (ideathonParticipant) {
            await DBUtils.updateEntity(StartupSeriesForm, { _id: doc_id }, { $set: { ideaValidationReportURL: fileUrl } });
        } else {
            await DBUtils.updateEntity(StartupSeriesForm, { _id: doc_id }, { $set: { completedApplicationForm: fileUrl } });
        }
    } catch(error){
        return { success:false,error}
    }
};

exports.getRegisteredEmailsAndPhones = async (req, res) => {};

// CAP Registration Form

exports.capForm = async (req, res) => {
    let { Name, Email, City,  Phone, prefix, CollegeName, Skills,   Experience, Qualification, Why_Ecell, What_make_you_join_CAP } = req.body;
    if (!Name || !Email || !City || !Phone || !prefix || !CollegeName || !Skills || !Experience || !Qualification || !Why_Ecell || !What_make_you_join_CAP) {
        res.redirect("/cap");
    }
    try {
        let CAPform = new capForm({
            Name,
            Email,
            City, 
            Phone,
            prefix,
            CollegeName,
            Skills,
            Experience,
            Qualification,
            Why_Ecell,
            What_make_you_join_CAP
        });
        await DBUtils.saveEntity(CAPform);
    } catch (e) {
        console.error("Error in storing message: ", e);
        res.redirect("/cap");
    }
    res.redirect("/cap");
};