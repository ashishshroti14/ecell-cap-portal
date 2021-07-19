const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const fs = require("fs");

const { config_aws_s3 } = require("../config/connection");
const { s3, bucketName } = config_aws_s3("startup-series");

const { pdfFilter } = require("../utils/pdfFilterForMulter");
const DataController = require("./DataController");

const storageS3 = multerS3({
    s3: s3,
    bucket: bucketName,
    acl: "public-read",
    key: function (req, file, cb) {
        const filePrefix = `${
            req.body.ideathonParticipant === "on" ? "IdeaValReport" : "AppForm"
        }-${req.body.leaderName.split(" ").join("-")}-${req.body.leaderPhone}`;
        cb(null, `${filePrefix}${path.extname(file.originalname)}`);
    },
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./startup-series-idea-val-reports");
    },

    filename: function (req, file, cb) {
        const filePrefix = `${
            req.body.ideathonParticipant === "on" ? "IdeaValReport" : "AppForm"
        }-${req.body.leaderName.split(" ").join("-")}-${req.body.leaderPhone}`;
        cb(null, `${filePrefix}${path.extname(file.originalname)}`);
    },
});

exports.submitStartupSeriesRegForm = async (req, res) => {
    
    //Upload the file *to the server* (not S3)
    let upload = multer({ storage: storage, fileFilter: pdfFilter }).single("file");

    //Check for errors. These errors won't occur as they are taken care of in the frontend. Just to be on the safe side.
    //The reasons are logged.
    upload(req, res, async function (err) {
        if (req.fileValidationError) {
            console.error("The uploaded file was not a PDF file.");
            res.status(415).send(req.fileValidationError);
        } else if (err instanceof multer.MulterError) {
            console.error("An error occured in multer");
            console.error(err);
            res.status(500).send(err);
        } else if (!req.file && req.body.ideathonParticipant === "on") {
            console.log("No file uploaded!");
            res.status(400).json({ code: 4400, message: "Please select an PDF file to upload." });
        } else if (err) {
            console.log("Any other error");
            console.error(err);
            res.status(err.statusCode).send(err);
        } else {

            //Call the function from data controller to save to DB.
            const uploadedToDB = await DataController.uploadToDB(req.body);

            //If it is successful, then proceed to upload the file to S3. 
            if (uploadedToDB.success) {
                if (req.body.ideathonParticipant === "on") {

                    // Read the file and upload it.
                    const file = fs.readFileSync(`./startup-series-idea-val-reports/${req.file.filename}`);
                    var objectParams = { Bucket: bucketName, Key: req.file.filename, Body: file, ACL: "public-read" };
                    s3.upload(objectParams, async function (err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            //If the upload is successful, add the file url to DB.
                            DataController.addFileURLToDB(
                                uploadedToDB.doc_id,
                                uploadedToDB.ideathonParticipant,
                                data.Location
                            );
                            console.log("Successfully uploaded file to S3 and saved to DB.");
                            res.status(200).send("Successfully uploaded file to S3 and saved to DB.");
                        }
                    });
                } else {
                    res.sendStatus(200);
                }
            } else {
                //11000 is the error code when there is a duplication of in the database.
                // (When a user tries to register with a single email or phone more than once)
                if (uploadedToDB.error.code === 11000) {

                    //Send forbidden error
                    res.status(403).json({
                        code: uploadedToDB.error.code,
                        message: `This ${
                            uploadedToDB.error.keyPattern.leaderPhone ? "mobile no." : "E-Mail"
                        } is already registered!`,
                        duplicate: uploadedToDB.error.keyPattern.leaderPhone ? "Mobile no." : "E-Mail",
                    });
                } else {
                    //If ANY other error occured in saving to database, delete the file that was uploaded to the server (not S3).
                    res.status(500).json({
                        code: uploadedToDB.error.code,
                        message: "Problem in saving data to database.",
                    });
                    fs.unlink(`./startup-series-idea-val-reports/${req.file.name}`, () => {
                        console.error("Error Occured. Uploaded file deleted from server.");
                    });
                }
            }
        }
    });
};
