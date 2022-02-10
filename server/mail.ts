import sgMail from '@sendgrid/mail'
import { config } from 'dotenv'
import logger  from './logging.js'
config()

sgMail.setApiKey(process.env.SENDGRID!)

export default function sendMail(text: string) {
  const msg = {
    to: 'constantingoeldel@gmail.com', 
    from: 'server@cardano-nft.de', 
    subject: "Update from server",
    text: text || "Something happend on the server"
  }
  process.env.MAIL  &&   sgMail
    .send(msg)
    .then(() => {
      logger.info('Email sent')
    })
    .catch((error) => {
      logger.error(error)
    })
}
