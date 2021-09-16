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

const wallet = cardano.wallet('Constantin')

function createTransaction(tx) {
  const rawTx = cardano.transactionBuildRaw(tx)
  const fee = cardano.transactionCalculateMinFee({ ...tx, txBody: rawTx })
  tx.txOut[0].value.lovelace -= fee
  return cardano.transactionBuildRaw({ ...tx, fee })
}

const signTransaction = (wallet, tx) => {
  return cardano.transactionSign({
    signingKeys: [wallet.payment.skey, wallet.payment.skey],
    txBody: tx,
  })
}

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

export async function mintNFT({ name, description, author, file }) {
  const assetName = name.replaceAll(' ', '_')
  const artHash = await uploadIpfs(file)
  const [policyId, policy] = createPolicy(keyHash, tip)
  const NFT = policyId + '.' + assetName
  const metadata = createMetadata(assetName, policyId, {
    name: name,
    image: 'ipfs://' + artHash,
    description,
    author,
  })
  const tx = {
    txIn: wallet.balance().utxo,
    txOut: [{ address: wallet.paymentAddr, value: { ...wallet.balance().value, [NFT]: 1 } }],
    mint: [{ action: 'mint', quantity: 1, asset: NFT, script: policy }],
    metadata: metadata,
    wittnessCount: 2,
  }
  console.log(assetName, artHash, policy, metadata, tx, NFT)
  const raw = createTransaction(tx)
  const signed = signTransaction(wallet, raw)
  const txHash = cardano.transactionSubmit(signed)
  return txHash
}

export async function mintToken() {}

mintNFT({
  name: 'Test',
  author: 'ME',
  description: 'This is a test',
  file:
    'https://api.typeform.com/responses/files/2f2194276fa1733f00e95f8535b53bcd8fde4d20ec77bd74d712c5268f4dc35b/canvas.png',
})
