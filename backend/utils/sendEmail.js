const nodeMailer = require("nodemailer");

const sendEmail = async function (to, subject, text) {

    try{

        const transporter = nodeMailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: text,
        };

        await transporter.sendMail(mailOptions);

    }catch (error) {
        console.error("Error sending email:", error.message);
    }
}

module.exports = sendEmail;

