// https://sendgrid.com/docs/API_Reference/Web_API_v3/Mail/errors.html
const { configSendGrid, apiKeys } = require("../config/sendGridConfig");
const sg = configSendGrid();

const EMAILS = {
    webops: "webops_ecell@smail.iitm.ac.in",
};
/**
 * Send password reset mails
 * @param {string} eventName The Event for which the E-Mail is being sent
 * @param {string} recipientMail The recipient's E-Mail ID
 * @param {string} resetCode The password change token
 * @param {string} senderMail The sender's E-Mail ID. Default: WebOps GMail
 */

async function sendPasswordResetMail(eventName, recipientMail, resetCode, senderMail = EMAILS.webops) {
    try {
        await sg.send({
            from: senderMail,
            to: recipientMail,
            subject: `${eventName} Password Reset`,
            html: `
            <span style="font-size: large;">Here's your password reset code for ${eventName}: </span>
            <br/> 
            <h1 style="text-align: center;">${resetCode}</h1>
            `,
        });
        console.log(`E-Mail sent to ${recipientMail}`);
    } catch (error) {
        console.log(error);

        const nextApiKey = apiKeys.next().value;
        sg.setApiKey(nextApiKey);

        await sendPasswordResetMail(...arguments);
        // Handle this in the controller
        // throw new Error("Email could not be sent.");
    }
}

/**
 * TeamUp specific: Send mail on selection of a project
 *
 * @param {string} recipientMail The recipient's E-Mail ID
 * @param {{title: string, mentorName: string}} projectDetails The details of the project in which the recipient got selected
 * @param {string} senderMail  The sender's E-Mail ID. Default: WebOps GMail
 */
async function sendSelectionMail(recipientMail, projectDetails, senderMail = EMAILS.webops) {
    try {
        await sg.send({
            from: senderMail,
            to: recipientMail,
            subject: `TeamUp, E-Cell IITM | Selected for ${projectDetails.title}`,
            html: `
            <h2>Congratulations!</h2>
            
            <h4>You have been selected by <strong>${projectDetails.mentorName}</strong> for their project: <strong>${projectDetails.title}</strong>
            
            Your contact details have been made available to them. Please wait for any further response for them.
            `,
        });
        console.log(`E-Mail sent to ${recipientMail}`);
    } catch (error) {
        console.log(error);

        const nextApiKey = apiKeys.next().value;
        sg.setApiKey(nextApiKey);

        await sendSelectionMail(...arguments);
        // throw new Error("Email could not be sent.");
    }
}

/**
 * Send Verification mail to someone
 *
 * @param {string} eventName The name of the E-Cell event
 * @param {string} recipientMail
 * @param {string} verificationCode
 * @param {string} [senderMail = WebOps Gmail]
 */
async function sendVerificationMail (eventName, recipientMail, verificationCode, senderMail = EMAILS.webops) {
    console.log(recipientMail);
    try {
        await sg.send({
            from: senderMail,
            to: recipientMail,
            subject: `${eventName}, E-Cell IITM | Verification Code`,
            html: `
        <span style="font-size: large;">Thank you for registering for ${eventName}!</span>
        <br/>
        Here is your verification code: 
        <br/>
        <h1 style="text-align: center;">${verificationCode}</h1>
        `,
        });
        console.log(`Email sent to ${recipientMail}`);
    } catch (error) {
        console.log(error.response.body.errors[0].message);

        const nextApiKey = apiKeys.next().value;
        sg.setApiKey(nextApiKey);

        await sendVerificationMail(...arguments);
        // throw new Error("Email could not be sent.");
    }
};
module.exports = { sendPasswordResetMail, sendSelectionMail, sendVerificationMail };
