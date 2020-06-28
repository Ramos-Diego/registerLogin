const nodemailer = require('nodemailer')

exports.sendVerificationEmail = async (email, code) => {
  // create reusable transporter object using the default SMTP transport
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: { rejectUnauthorized: false }
    })

    // send email with defined transport object
    await transporter.sendMail({
      from: `"An app" <${process.env.EMAIL}>`,
      to: email, // list of receivers
      subject: 'Verification Code for an app',
      html: `<b>Your verification code is: ${code}</b>`
    })
  } catch (err) {
    console.log(err)
  }
}
