import { cardano, wallet, handleMint, requests, updateStatus } from './server.js'
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

let receivedPayments: { [txHash: string]: receivedPayment } = {}

export async function checkUTXOs() {
  let newPaymentRegistered = false
  const utxos: utxo[] = cardano.queryUtxo(wallet.paymentAddr)
  logger.log({
    level: 'verbose',
    message: 'Current status: ',
    utxos: utxos.length,
    payments: receivedPayments.length,
    request: requests.length,
    type: 'status',
  })

  utxos.forEach(async (utxo) => {
    if (receivedPayments[utxo.txHash]) return
    try {
      const tx = await blockfrost.txsUtxos(utxo.txHash)
      const newPayment = { amount: 0, payer: '' }
      tx.outputs.forEach((output) => {
        if (output.address === wallet.paymentAddr) {
          newPayment.amount = Number.parseFloat(
            output.amount.find((a) => a.unit === 'lovelace')!.quantity
          )
          newPayment.payer = tx.inputs[0].address
        }
      })
      receivedPayments[utxo.txHash] = newPayment
      payments.insertOne(newPayment)
      checkPayment(
        newPayment,
        requests.filter((r) => r.status === 'pending')
      )
    } catch (error) {
      logger.log({
        level: 'error',
        message: 'Error while processing UTXO',
        error: error,
        type: 'error',
      })
    }
  })
}

function checkPayment(payment: receivedPayment, openRequests: mintParams[]) {
  logger.log({
    message: 'Checking payment',
    payment: payment,
    openRequests: openRequests.length,
    level: 'verbose',
  })
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
      updateStatus(req.id, 'paid')
      logger.info('Starting minting process')
      handleMint(req)
    }
  }
}

setInterval(() => checkUTXOs, 10000)
