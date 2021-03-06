import { wallet, handleMint, requests } from './server.js'
import logger from './logging.js'
import { payments, updateStatus } from './db.js'
import { BlockFrostAPI } from '@blockfrost/blockfrost-js'


const devMode = !!process.env.DEV || false
const blockFrostApiKey = devMode
  ? process.env.BLOCKFROST_API_KEY_TESTNET!
  : process.env.BLOCKFROST_API_KEY_MAINNET!

export const blockfrost = new BlockFrostAPI({
  projectId: blockFrostApiKey,
  isTestnet: devMode,
})

let receivedPayments: { [txHash: string]: receivedPayment } = {}

export async function checkUTXOs() {
  try {
      const utxos = await blockfrost.addressesUtxos(wallet.paymentAddr)
      const hashes = utxos.map((utxo) => utxo.tx_hash)

  logger.log({
    level: 'verbose',
    message: 'Status:',
    utxos: utxos.length,
    payments: receivedPayments.length,
    request: requests.length,
    type: 'status',
  })

  hashes.forEach(async (hash) => {
    if (receivedPayments[hash]) return
    
      const tx = await blockfrost.txsUtxos(hash)
      const newPayment = { amount: 0, payer: '' }
      tx.outputs.forEach((output) => {
        if (output.address === wallet.paymentAddr) {
          newPayment.amount = Number.parseFloat(
            output.amount.find((a) => a.unit === 'lovelace')!.quantity
          )
          newPayment.payer = tx.inputs[0].address
        }
      })
      receivedPayments[hash] = newPayment
      logger.log({ message: 'New payment received', payment: newPayment, level: 'verbose' })
      payments.insertOne(newPayment)
      checkPayment(
        newPayment,
        requests.filter((r) => r.status !== 'minted')
      )
    
  })
} catch (error) {
  logger.log({
    level: 'error',
    message: 'Error while processing UTXO',
    error: error,
    type: 'error',
  })
}
setTimeout(checkUTXOs, 5000)
}

function checkPayment(payment: receivedPayment, openRequests: mintParams[]) {
  for (const [i, req] of openRequests.entries()) {
    if (payment.amount === req.price || payment.amount === req.price * 1_000_000) {
      logger.info({
        message: 'Found match for incoming payment, starting minting process',
        type: 'match',
        request: req.id,
      })
      req.paid = true
      req.addr = payment.payer
      updateStatus(req.id, 'paid')
      handleMint(req)
    }
  }
}
