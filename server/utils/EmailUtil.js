const nodemailer = require('nodemailer');
const MyConstants = require('./MyConstants');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: MyConstants.EMAIL_USER,
    pass: MyConstants.EMAIL_PASS
  }
});

const EmailUtil = {
  send(email, id, token) {
    const text =
      'Thanks for signing up, please input these informations to activate your account:\n' +
      '\t.id: ' + id + '\n' +
      '\t.token: ' + token;

    return new Promise(function (resolve, reject) {
      const mailOptions = {
        from: MyConstants.EMAIL_USER,
        to: email,
        subject: 'Signup | Verification',
        text: text
      };

      transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
          console.error('EmailUtil.send error:', err.message || err);
          return reject(new Error('Failed to send email: ' + (err.message || 'Unknown error')));
        }
        console.log('Email sent successfully to:', email);
        resolve(true);
      });
    });
  }
};

module.exports = EmailUtil;