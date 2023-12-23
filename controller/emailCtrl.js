const nodemailer = require ('nodemailer');
const asyncHandler = require ('express-async-handler');

const sendEmail = asyncHandler(async (data, req, res) => {
    
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.MAIL_ID,
        pass: process.env.MP,
      },
    });
    try {
      const info = await transporter.sendMail({
        from: 'Hey 👻 <SlipinJimmySolutions@gmail.com>',
        to: data.to,
        subject: data.subject,
        text: data.text,
        html: data.htm,
      });
      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      throw new Error("Failed to send email");
    }
  });
  
module.exports = sendEmail;