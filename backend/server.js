const { parse } = require('dotenv');
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

//nodemailer transporter setup
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === 465, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

app.post('/api/send-bulk-email', async (req, res) => {
    const {emails , subject, htmlContent} = req.body;

    if(!emails || !Array.isArray(emails) || emails.length === 0){
        return res.status(400).json({error: "Missing or invalid 'emails' array."});
    }
    if(!htmlContent){
        return res.status(400).json({error: "Missing 'htmlContent' string from frontend."})
    }
    if (!subject) {
    return res.status(400).json({ error: "Missing email 'subject'." });
    }
    res.status(202).json({ 
    message: `Broadcast started for ${emails.length} recipients. Processing in background...` 
    });
    
    console.log(`Starting transmission to ${emails.length} addresses...`);

    for(const email of emails){
        try {
            const mailOptions = {
                from: process.env.SMTP_USER,
                to: email,
                subject: subject,
                html: htmlContent,
            };

            await transporter.sendMail(mailOptions);
            console.log(`Delivered to : ${email}`);

            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
            console.error(`Failed transmission to ${email}:`, error.message);
        }
    }
    console.log("All emails processed.");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Mailer backend service actively listening on port ${PORT}`)
})
