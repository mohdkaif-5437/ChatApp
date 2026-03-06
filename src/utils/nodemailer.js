import nodemailer from 'nodemailer';
const transporter = nodemailer.createTransport({
    host:'smtp-relay.brevo.com',
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_USER_SECRET,
    }
    
});
transporter.verify((error, success) => {
    if (error) {
        console.error("SMTP connection error:", error);
    } else {
        console.log("SMTP connection successful:", success);
    }
    
});
export default transporter;