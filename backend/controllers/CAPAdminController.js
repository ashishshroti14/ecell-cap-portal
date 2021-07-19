const bcrypt = require("bcrypt");
const { sign: signJWT } = require("jsonwebtoken");
const { process400, process500, processData, process404, process401 } = require("../utils/ResponseUtils");
const {
    updateEntity,
    getEntityForId,
    getEntities,
    getAllEntities,
} = require("../utils/DBUtils")();
const Ambassador = require("../models/capPortal/ambassador");
const Task = require("../models/capPortal/task");
const DocCount = require("../models/capPortal/docCount");
const DocGroup = require("../models/capPortal/docGroup");

const verifyRequest = require("../utils/VerifyRequest");

const CAP_SIGNATURE_STRING =
    "c8a89227797a819ca13c2a89fc34e10f5118c782420099b16a8ba70c05a649992294920297fab9a72b37fcf58cde216187873192f6bbb450f85816c82e46fc0b";

//Login Route
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await Ambassador.findOne({ email }).exec();
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


exports.getTasksAdmin = async (req, res) => {
    verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);
    try{
        const tasks = await getAllEntities(Task)
        processData(res, tasks);
    }
    catch(error){
        console.log(error);
        process500(res, error.message ? error.message : error);
    }
}
exports.getAmbassadorsAdmin = async (req, res) => {
    verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);
    try{
        if(req.query.taskId){
        const taskId = req.query.taskId
        const docCounts = await getEntities(DocCount, {taskId: taskId})
        var updatedAmbassadors = await Promise.all(await docCounts.map(
            async ambassador => {
                try{
                var ambassadorData = await getEntityForId(Ambassador,  ambassador.ambassadorId)
                return {...ambassador._doc, name: ambassadorData.name, email: ambassadorData.email, points: ambassadorData.points, avatarURL: ambassadorData.avatarURL, collegeName: ambassadorData.collegeName }
                }
                catch (error){
                    console.log(error)
                }
            }
        ))
        }
        else{
             updatedAmbassadors = await getAllEntities(Ambassador)
        }
        updatedAmbassadors = updatedAmbassadors.filter(ambassador => ambassador !== undefined && ambassador !== null)
        processData(res, updatedAmbassadors);
    }
    catch(error){
        console.log(error);
        process500(res, error.message ? error.message : error);
    }
}

exports.getAvenuesAdmin = async (req, res) => {
    verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);
    try{
        const taskId = req.query.taskId
        const ambassadorId = req.query.ambassadorId
        const docGroups = await getEntities(DocGroup, {taskId, ambassadorId})
        processData(res, docGroups);
    }
    catch(error){
        console.log(error);
        process500(res, error.message ? error.message : error);
    }
}
exports.updatePoints = async (req, res) =>  {
    verifyRequest(req.headers.cookie, "ECELL_CAP_AUTH_TOKEN", CAP_SIGNATURE_STRING);
    try{
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
