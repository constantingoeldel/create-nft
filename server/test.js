import { BlockFrostAPI } from '@blockfrost/blockfrost-js'
import CardanoCliJs from 'cardanocli-js'
import { config } from 'dotenv'
config()
const shelleyGenesisPath = process.env.GENESIS_PATH || ''
const cardano = new CardanoCliJs({ shelleyGenesisPath })

const blockfrost = new BlockFrostAPI({
  projectId: process.env.BLOCKFROST_API_KEY_MAINNET,
})

const wallet = cardano.wallet('Constantin')

async function payerAddr(txHash) {
  let info = {
    received: 0,
    payer: '',
  }
  const tx = await blockfrost.txsUtxos(txHash)
  console.log(tx)
  tx.outputs.forEach((output) => {
    output.address === wallet.paymentAddr &&
      (info.received = output.amount.find((a) => a.unit === 'lovelace').quantity) &&
      (info.payer = tx.inputs[0].address)
  })
  return info
}

const res = await payerAddr('debd74a519c4f672558b3ee768e55d0d7459375c055968f1e5502a98041ddc7d')

console.log(res)
