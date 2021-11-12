import {
  cardano,
  wallet,
  receivedPayments,
  openRequests,
  paidRequests,
  successfulRequests,
  handleMint,
} from './server.js'
import logger from './logging.js'
import { payments } from './db.js'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'

const devMode = !!process.env.DEV || false

const blockFrostApiKey = devMode
  ? process.env.BLOCKFROST_API_KEY_TESTNET!
  : process.env.BLOCKFROST_API_KEY_MAINNET!

const blockfrost = new BlockFrostAPI({
  projectId: blockFrostApiKey,
  isTestnet: devMode,
})

let utxos = []

export async function checkUTXOs() {
  utxos = cardano.queryUtxo(wallet.paymentAddr).reverse()
  logger.log({
    level: 'verbose',
    message: 'Current status: ',
    utxos: utxos.length,
    payments: receivedPayments.length,
    openRequests: openRequests.length,
    paidRequests: paidRequests.length,
    successfulRequests: successfulRequests.length,
    type: 'status',
  })
  if (openRequests.length >= 1 && utxos) {
    const prices = openRequests.map((req) => req.price)
    // @ts-ignore
    const utxoPrices = utxos.map((tx) => tx.value.lovelace)
    logger.log({ level: 'verbose', message: 'These requests exist: ' + prices, utxos: utxoPrices })
  }

  if (receivedPayments.length < utxos.length) {
    try {
      const payment: receivedPayment = await payerAddr(utxos[receivedPayments.length].txHash)
      receivedPayments.push(payment)
      payments.insertOne(payment)
      checkPayment(receivedPayments, openRequests)
      checkUTXOs()
    } catch (error) {
      logger.error(error)
      checkUTXOs()
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 20000))
    checkPayment(receivedPayments, openRequests)
    checkUTXOs()
  }
}

async function payerAddr(txHash: string) {
  let info = {
    amount: 0,
    payer: '',
  }
  const tx = await blockfrost.txsUtxos(txHash)
  tx.outputs.forEach((output) => {
    if (output.address === wallet.paymentAddr) {
      info.amount = Number.parseFloat(output.amount.find((a) => a.unit === 'lovelace')!.quantity)
      info.payer = tx.inputs[0].address
    }
  })
  return info
}

function checkPayment(payments: receivedPayment[], openRequests: mintParams[]) {
  logger.log({
    message: 'Checking payment',
    payments: payments.length,
    openRequests: openRequests.length,
    level: 'verbose',
  })
  for (const payment of payments) {
    for (const [i, req] of openRequests.entries()) {
      if (req.price === payment.amount) {
        logger.info({
          message: 'Found match for incoming payment',
          type: 'match',
          request: req.id,
          addres: payment.payer,
        })
        req.paid = true
        req.addr = payment.payer
        paidRequests.push(req)
        openRequests.splice(i, 1)
        logger.info('Starting minting process')
        handleMint(req)
      }
    }
  }
}

// setInterval(() => checkPayment(receivedPayments, openRequests), 10000)
