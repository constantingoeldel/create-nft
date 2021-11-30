import { nanoid } from 'nanoid'

import { cardano, handleMint } from '../server.js'
import { customers, requests as requestsDB } from '../db.js'
import logger from '../logging.js'

// @ts-ignore
export default async function create(req, res) {
  const request: request = req.fields
  if (!request) {
    res.status(400).end('No request provided')
    return
  }
  const customer = await customers.findOne({ token: request.auth })
  if (!customer) {
    logger.info('Customer not found')
    res.status(401).end('Not authenticated')
    return
  }
  const correctType = req.params.type === 'nft' || req.params.type === 'native'
  if (!correctType) {
    logger.info('Invalid type')
    res.status(400).end('Not a valid token type')
    return
  }
  // @ts-ignore
  const type: 'nft' | 'token' = req.params.type
  request.amount = type === 'token' ? request.amount : 1
  if (!request.amount) {
    logger.info('No amount specified')
    res.status(400).end('No amount specified')
    return
  }
  const customerWallet = cardano.wallet(customer.id)
  const sufficientBalance: boolean = customerWallet.balance().value.lovelace > 2_000_000
  if (!sufficientBalance) {
    logger.info('Insufficient balance')
    res
      .status(402)
      .end(
        'Wallet balance not sufficient, please top up this address: ' + customerWallet.paymentAddr
      )
    return
  }
  const id = nanoid()
  const params: mintParams = {
    id,
    type: type === 'token' ? 'FT' : 'NFT',
    amount: type === 'token' ? request.amount : 1,
    timestamp: Date.now(),
    properties: request.properties,
    paid: true,
    status: 'pending',
    minted: false,
    addr: customerWallet.paymentAddr,
    price: 2_000_000,
    walletId: customer.id,
  }
  logger.info('Received new API request, id: ' + params.id)
  await requestsDB.insertOne(params)
  const minted = await handleMint(params)
  res.status(200).json(minted).end()
}
