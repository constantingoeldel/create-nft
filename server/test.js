import { BlockFrostAPI } from '@blockfrost/blockfrost-js'
import CardanoCliJs from 'cardanocli-js'
import { config } from 'dotenv'
config()
console.log(process.env.CARDANO_NODE_SOCKET_PATH)

export const devMode = true
export const bearer = process.env.BEARER_TOKEN
const shelleyGenesisPath = process.env.GENESIS_PATH
const port = devMode ? process.env.PORT_TEST : process.env.PORT

export const cardano = devMode
  ? new CardanoCliJs({ shelleyGenesisPath, network: 'testnet-magic 1097911063' })
  : new CardanoCliJs({ shelleyGenesisPath })

export const wallet = devMode ? cardano.wallet('TestnetReceiver') : cardano.wallet('Constantin')

console.table(wallet.balance().utxo)
console.log(wallet.balance().utxo[0])
