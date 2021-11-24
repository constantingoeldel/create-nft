import { createTransport } from 'nodemailer'
import { config } from 'dotenv'
config()
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
})

export default function sendMail(text: string) {
  if (!process.env.MAIL) return
  const mailConfigurations = {
    from: 'constantingoeldel@gmail.com',
    to: 'constantin.goeldel@tum.de',
    subject: 'Update from the NFT Server',
    text: text,
  }

  transporter.sendMail(mailConfigurations, function (error, info) {
    if (error) throw Error(String(error))
    console.log('Email Sent Successfully')
  })
}
