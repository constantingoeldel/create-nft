import { nanoid } from 'nanoid'
import { customers } from '../db.js'
import logger from '../logging.js'
import { cardano } from '../server.js'

// @ts-ignore
export default function newCustomer(_, res) {
  const id = nanoid()
  const wallet = cardano.addressKeyGen(id)
  cardano.addressBuild(id, { paymentVkey: wallet.vkey })
  const paymentAddr: string = cardano.wallet(id).paymentAddr
  const token = nanoid()
  const createdAt = Date.now()

  customers.insertOne({ id, paymentAddr, token, createdAt })
  logger.log({ message: 'Created new customer: ' + id, level: 'info' })
  res.status(200).json({ paymentAddr, token }).end()
}
