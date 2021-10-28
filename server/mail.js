"use strict";
exports.__esModule = true;
var nodemailer_1 = require("nodemailer");
var dotenv_1 = require("dotenv");
dotenv_1.config();
var transporter = nodemailer_1.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
    }
});
function sendMail(text) {
    var mailConfigurations = {
        from: 'constantingoeldel@gmail.com',
        to: 'constantin.goeldel@tum.de',
        subject: 'Update from the NFT Server',
        text: text
    };
    transporter.sendMail(mailConfigurations, function (error, info) {
        if (error)
            throw Error(String(error));
        console.log('Email Sent Successfully');
    });
}
exports["default"] = sendMail;
