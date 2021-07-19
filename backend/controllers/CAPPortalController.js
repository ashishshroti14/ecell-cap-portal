const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sign: signJWT } = require("jsonwebtoken");
const { process400, process500, processData, process404, process401 } = require("../utils/ResponseUtils");
const {
    bulkInsertEntities,
    getEntity,
    saveEntity,
    updateEntity,
    getEntityForId,
    getEntityForIds,
    getEntities,
    getAllEntities,
} = require("../utils/DBUtils")();
const verifyRequest = require("../utils/VerifyRequest");
const { S3SignedPolicy } = require("../utils/S3ClientUploader");

const Ambassador = require("../models/capPortal/ambassador");
const Task = require("../models/capPortal/task");
const DocCount = require("../models/capPortal/docCount");
const DocGroup = require("../models/capPortal/docGroup");

const { sendVerificationMail, sendPasswordResetMail } = require("../utils/EmailUtils");
const DBUtils = require("../utils/DBUtils");
const ambassador = require("../models/capPortal/ambassador");

const CAP_SIGNATURE_STRING =
    "759305aea75b1bf510ba595a269d73ad4e2fccfa3b53dd635db9c2b0e3ba97f4c0c117b34228c667658d6a27a1e6502fc573c0231bc01aea8d65d261452c3e7f";

// Route for verifying email
exports.verifyAndSendMail = async (req, res) => {
    const { email } = req.body;
    let docs = await Ambassador.find({ email: email.toLowerCase() });

    if (docs.length > 0) {
        process400(res, `The email, ${email} is already associated with another account.`);
        return;
    }

    try {
        const code = crypto.randomBytes(3).toString("hex").toUpperCase();
        await sendVerificationMail("Campus Ambassador Programme", email, code);
        console.log(`Put ${code} as the verification code.`);

        res.cookie("ECELL_CAP_VERIFICATION_TOKEN", code);
        processData(res, "Verification Email sent");
    } catch (error) {
        console.log(error);
        process500(res, "Mail coudn't be sent. Please try again tomorrow.");
    }
};

//Register Route
exports.register = async (req, res) => {
    const { name, email, collegeName, password } = req.body;
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await new Ambassador({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            collegeName,
            points: 0,
        }).save();

        const signedToken = signJWT({ email: email.toLowerCase() }, CAP_SIGNATURE_STRING);

        res.cookie("ECELL_CAP_LOGGED_IN", "user");
        res.cookie("ECELL_CAP_AUTH_TOKEN", signedToken, {
            sameSite: true,
            httpOnly: true,
            // Use below with https
            secure: true,
        });

        // extract out the unwanted stuff
        const { __v, creationTime, lastUpdated, ...leanUser } = user.toObject();
        delete leanUser.password;

        res.clearCookie("ECELL_CAP_VERIFICATION_TOKEN");
        processData(res, leanUser);
    } catch (error) {
        console.log(error);
        if (error.code === 11000) {
            const dupEmail = error.keyValue.email && error.keyValue.email;
            process400(
                res,
                `The email, ${dupEmail} is already associated to another registered account. Please use another email.`
            );
        } else {
            process500(res);
        }
    }
};

//Login Route
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Ambassador.findOne({ email: email.toLowerCase() }).exec();
        if (!user) {
            process404(res, "No User was found with this Email.", "email_not_found");
            return;
        }
        const passwordCorrect = await bcrypt.compare(password, user.password);

        if (passwordCorrect) {
            const signedToken = signJWT({ email }, CAP_SIGNATURE_STRING);
            res.cookie("ECELL_CAP_LOGGED_IN", "user");
            res.cookie("ECELL_CAP_AUTH_TOKEN", signedToken, {
                sameSite: true,
                httpOnly: true,
                // Use below with https
                secure: true,
            });

            // extract out the unwanted stuff
            const { __v, creationTime, lastUpdated, ...leanUser } = user.toObject();
            delete leanUser.password;

            processData(res, leanUser);
        } else {
            process401(res, "The password is incorrect.", "password_wrong");
        }
    } catch (error) {
        process500(res, "An error occured", error.message);
        console.log(error);
    }
};

// Logout Route
exports.logout = async (req, res) => {
    try {
        verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);

        res.clearCookie(`ECELL_CAP_LOGGED_IN`);
        res.clearCookie(`ECELL_CAP_AUTH_TOKEN`);

        processData(res, "Logged out");
    } catch (err) {
        process500(res, err.message);
        console.log(err);
    }
};

// Get Users (for leaderboard)
exports.getUsers = async (req, res) => {
    try {
        const { email } = verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);

        const allUsers = await (await Ambassador.find({}).lean()).map((user) => {
            const { password, creationTime, lastUpdated, _v, _id, ...filteredUser } = user;
            return filteredUser;
        });

        const currentUser = allUsers.find((user) => user.email === email);
        processData(res, { currentUser, allUsers });
    } catch (error) {
        process500(res);
        console.log(error);
    }
};

// "Forgot password" routes: Shamelessly copied from me
exports.sendPasswordResetMail = async (req, res) => {
    try {
        const email = req.body.email;
        const user = await getEntity(Ambassador, { email });

        if (!user) {
            process400(res, "No team was found with the E-Mail.");
            return;
        }

        const pw = user.password;
        const code = crypto.createHash("md5").update(pw).digest("hex");

        await sendPasswordResetMail("Campus Ambassador Programme", email, code);
        console.log(code);

        processData(res, "E-Mail sent.");
    } catch (error) {
        console.log(error);
        process500(res, "Sorry. An error occured.");
    }
};

exports.resetPasswordFromCode = async (req, res) => {
    try {
        const { email, newPassword, resetCode } = req.body;
        const user = await getEntity(Ambassador, { email });

        if (!user) {
            process400(res, "No account was found with the E-Mail.");
            return;
        }
        const pw = user.password;
        const codeFromUser = crypto.createHash("md5").update(pw).digest("hex");

        const resetCodeCorrect = resetCode === codeFromUser;

        if (resetCodeCorrect) {
            const newHashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = newHashedPassword;

            await saveEntity(user);

            processData(res, "Updated!");
        } else {
            process400(res, "Reset code is incorrect");
        }
    } catch (error) {
        console.log(error);
        process500(res, "Sorry. An error occured.");
    }
};

// Dashboard routes
exports.updateTask = async (req, res) => {
    try {

        const { email } = verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);

        const ambassador = await getEntity(Ambassador, { email });
        
        const ambassadorId = ambassador._id;
        const task = await getEntity(Task, { taskName: req.body.task.taskName });
        const taskId = task._id;
        const avenue = req.body.task.avenue;

        const urls = req.body.task.urls !== undefined ? req.body.task.urls : [];
        const numOfDocs = req.body.task.urls ? req.body.task.urls.length : 0;

        if (urls) {
            const oldDocCount = await getEntity(DocCount, { taskId, ambassadorId });
            if (oldDocCount) {
                // console.log(urls, urls.length, "urls");
                const updatedNumOfDocs = oldDocCount.numOfDocs + (urls !== [] || undefined ? urls.length : 0);
                //inputAvenue is the avenue received from the form
                const updatedAvenues = oldDocCount.avenues.filter((a) => a === avenue)[0]
                    ? oldDocCount.avenues
                    : [...oldDocCount.avenues, avenue];

                await updateEntity(
                    DocCount,
                    { taskId, ambassadorId },
                    { numOfDocs: updatedNumOfDocs, avenues: updatedAvenues }
                );
            } else {
                const avenues = [avenue];
                let docCount = new DocCount({ ambassadorId, taskId, avenues, numOfDocs }); //basic requirements
                await saveEntity(docCount);
            }

            const oldDocGroup = await getEntity(DocGroup, { taskId, ambassadorId, avenue });
            if (oldDocGroup) {
                const updatedUrls = [...oldDocGroup.urls, ...urls];
                await updateEntity(DocGroup, { taskId, ambassadorId, avenue }, { urls: updatedUrls });
            } else {
                let docGroup = new DocGroup({ ambassadorId, taskId, avenue, urls }); //basic requirements
                await saveEntity(docGroup);
            }

            const oldTask = await getEntity(Task, { _id: taskId });
            
            const updatedAmbassadorIds = [...oldTask.ambassadorIds.filter((id) => id != ambassadorId), ambassadorId];
            await updateEntity(Task, { _id: taskId }, { ambassadorIds: updatedAmbassadorIds });

            console.log("task updated");

            processData(res, "task updated");
        }
    } catch (error) {
        console.log(error);
        process500(res, error.message ? error.message : error);
    }
};

exports.getTask = async (req, res) => {
    try {
        verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);

        const task = await getEntity(Task, { active: "true" });

        processData(res, { task });
    } catch (error) {
        process500(res);
        console.log(error);
    }
};

exports.getS3SignedPolicy = async (req, res) => {
    try {
        verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);

        const signedPolicy = new S3SignedPolicy(req.params.bucketName);
        processData(res, signedPolicy);
    } catch (error) {
        process500(res, error.message);
    }
};

exports.updateAvatar = async (req, res) => {
    try {
        const { email } = verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);

        const ambassador = await getEntity(Ambassador, { email });

        try {
            const { avatarURL } = req.body;

            if (avatarURL) {
                await updateEntity(Ambassador, { _id: ambassador._id }, { avatarURL });
            }
            processData(res, "Successfully updated");
        } catch (error) {
            console.log(error);
            process500(res, error.message ? error.message : error);
        }
        return;
    } catch (error) {
        console.log(error.message);
        if (error.message === "Not authorized") {
            process401(res, error);
            return;
        }
        process500(res);
    }
};

exports.getAvatar = async (req, res) => {
    try {
        const { email } = verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);
        const ambassador = await getEntity(Ambassador, { email });

        const avatarURL = ambassador.avatarURL;

        processData(res, avatarURL);
    } catch (error) {
        if (error === "Invalid 'for' query") {
            process400(res, error);
        } else {
            process500(res, error.message ? error.message : error);
        }
    }
};

// Change password route
exports.changePassword = async (req, res) => {
    try {
        const { email } = verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);
        const { passwords } = req.body;

        const user = await getEntity(Ambassador, { email });

        let credentialsCorrect = await bcrypt.compare(passwords.currentPassword, user.password);

        if (credentialsCorrect) {
            let hashedPassword = await bcrypt.hash(passwords.newPassword, 10);

            await updateEntity(Ambassador, { email }, { password: hashedPassword });
            processData(res, "Successfully changed password.");
        } else {
            process400(
                res,
                "The current passsword you entered is wrong. Please ensure you've entered the correct password."
            );
            console.log("Wrong password for update");
        }
    } catch (error) {
        console.log(error);
        process500(res, error.message ? error.message : error);
    }
};

exports.getTasksAdmin = async (req, res) => {
    try{
        // console.log("requested received")
        const tasks = await getAllEntities(Task)
        // console.log(tasks);
        processData(res, tasks);
        // console.log("tasks sent")
    }
    catch(error){
        console.log(error);
        process500(res, error.message ? error.message : error);
    }
}

exports.getAmbassadorsAdmin = async (req, res) => {
    try{
        // console.log(req.query.taskId)
        const taskId = req.query.taskId
        // console.log("requested received")
        const docCounts = await getEntities(DocCount, {taskId: taskId})
        // console.log(ambassadors);
        var updatedAmbassadors = await Promise.all(await docCounts.map(
            async ambassador => {
                try{
                    
                // console.log(ambassador.ambassadorId)
                var ambassadorData = await getEntityForId(Ambassador,  ambassador.ambassadorId)
                    // ambassadorData = ambassadorData.filter(ambassador => ambassador !== undefined || ambassador !== null)
                // console.log(ambassadorData.name)
                return {...ambassador._doc, name: ambassadorData.name, email: ambassadorData.email, points: ambassadorData.points, avatarURL: ambassadorData.avatarURL, collegeName: ambassadorData.collegeName }
                }
                catch (error){
                    console.log(error)
                }
            }
        ))
        // console.log(updatedAmbassadors[0])
        updatedAmbassadors = updatedAmbassadors.filter(ambassador => ambassador !== undefined && ambassador !== null)
        // console.log(updatedAmbassadors.length)
        // console.log(updatedAmbassadors)
        processData(res, updatedAmbassadors);
        // console.log("tasks sent")
    }
    catch(error){
        console.log(error);
        process500(res, error.message ? error.message : error);
    }
}

exports.getAvenuesAdmin = async (req, res) => {
    try{
        // console.log(req.query.taskId, "aaaa")
        // console.log(req.query.ambassadorId, "ddddd")
        const taskId = req.query.taskId
        const ambassadorId = req.query.ambassadorId
        // console.log("request received")

        const docGroups = await getEntities(DocGroup, {taskId, ambassadorId})





        // const  = await getEntities(DocCount, {taskId: taskId})
        // console.log(ambassadors);
        // const updatedAmbassadors = await Promise.all(await ambassadors.map(
        //     async ambassador => {
        //         try{
        //         // console.log(ambassador.ambassadorId)
        //         const ambassadorData = await getEntityForId(Ambassador,  ambassador.ambassadorId)
        //         // console.log(ambassadorData.name)
        //         return {...ambassador._doc, name: ambassadorData.name, email: ambassadorData.email, points: ambassadorData.points, avatarURL: ambassadorData.avatarURL }
        //         }
        //         catch (error){
        //             console.log(error)
        //         }
        //     }
        // ))
        
        // console.log(docGroups)
        processData(res, docGroups);
        // console.log("avenues sent")
    }
    catch(error){
        console.log(error);
        process500(res, error.message ? error.message : error);
    }
}

exports.updatePoints = async (req, res) =>  {
    try{
    //  console.log(req.body)
     const points = req.body.points
     const ambassadorId  = req.body.ambassadorId

     await updateEntity(Ambassador, {_id: ambassadorId}, {points})
     processData(res, points);

    }
    catch(error){
        console.log(error);
        process500(res, error.message ? error.message : error);
    }
    
}