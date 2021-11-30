import { cardano } from '../server.js'
import { customers } from '../db.js'
import logger from '../logging.js'

// @ts-ignore
export default async function balance(req, res) {
  const token: string | undefined = req.params.token
  if (!token) {
    res.status(400).end('No request provided')
    return
  }
  const customer = await customers.findOne({ token: token })
  if (!customer) {
    logger.info('Customer not found')
    res.status(401).end('Not authenticated')
    return
  }
  const customerWallet = cardano.wallet(customer.id)
  const balance = customerWallet.balance().value.lovelace
  logger.info('Request wallet balance for customer ' + customer.id)
  res
    .status(200)
    .json({ balance: balance / 1_000_000, currency: 'ADA', walletAddr: customerWallet.paymentAddr })
    .end()
}
