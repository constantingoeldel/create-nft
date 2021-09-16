import { config } from 'dotenv'
import uploadIpfs from './ipfs.js'
import CardanoCliJs from 'cardanocli-js'
config()

const shelleyGenesisPath =
  '/home/constantin/.cardano/configuration/cardano/mainnet-shelley-genesis.json'
const socketPath = '/home/constantin/.cardano/mainnet/db/node.socket'
const cardano = new CardanoCliJs({ shelleyGenesisPath, socketPath })

const tip = cardano.queryTip().slot
const keyHash = process.env.POLICY_KEY
// const artHash = await uploadIpfs('/home/constantin/Downloads/ausweis.jpg')
const assetName = 'Test123'

const [policyId, policy] = createPolicy(keyHash, tip)
const metadata = createMetadata(assetName, policyId, { name: 'Test', image: 'ipfs://' })

// const txIn = cardano.wallet('name')
const NFT = policyId + '.' + assetName
const protocolParameters = cardano.queryProtocolParameters()
const transaction = {
  txIn: [{ txHash: process.env.TX_IN, txId: '0' }],
  txOut: [{ address: process.env.BASE_ADDR, value: { lovelace: 2834587, [NFT]: 1 } }],
  mint: [{ action: 'mint', quantity: 1, asset: NFT, script: policy }],
  metadata: metadata,
}
console.log(transaction)
const rawTx = cardano.transactionBuildRaw(transaction)
console.log(rawTx)

function createPolicy(keyHash, tip) {
  const policy = {
    type: 'all',
    scripts: [
      {
        keyHash: keyHash,
        type: 'sig',
      },
      {
        type: 'before',
        slot: tip + 300,
      },
    ],
  }

  return [cardano.transactionPolicyid(policy), policy]
}

function createMetadata(assetName, policyId, optionalMetadata) {
  return {
    721: {
      [policyId]: {
        [assetName]: optionalMetadata,
      },
    },
  }
}
