const nodemailer = require ('nodemailer');
const transporter = nodemailer.createTransport({
    // host: 'smtp.ethereal.email',
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PWD
    }
});

const send = (information) => {
    return new Promise (async (resolve,reject) => {
        try {
            let info = await transporter.sendMail(information);
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            resolve(info)
        } catch (error) {
            console.log(error)
        }
    })
    
}


const emailProcessor = (email,pin) => {

    return new Promise (async (resolve,reject) => {
        try {
            const info = {
                from: '"CRM" <sanford.damore45@ethereal.email>', // sender address
                to: email, // list of receivers
                subject: "Password Reset Pin", // Subject line
                text: "Here is your Password Reset pin "+ pin+ ". This pin will expire in 30 minutes. ", // plain text body
                html: `<p> Here is your Password Reset Pin </p> <p><b> ${pin} </b></p> <p>This will pin expire in 30 minutes. </p> `, // html body
            }
            const resolvedinfo = await send(info);
            resolve(resolvedinfo)
        } catch (error) {
            console.log(error);
        }
    })
}

module.exports = {emailProcessor}