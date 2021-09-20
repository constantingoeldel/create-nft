import { config } from 'dotenv'
import uploadIpfs from './ipfs.js'
import CardanoCliJs from 'cardanocli-js'
config()

interface Policy {}

interface Metadata {
  721: {
    [policyId: string]: {
      [assetName: string]: {}
    }
  }
}
interface Tx {
  txIn: { txHash: string; txId: string }[]
  txOut: {
    address: string
    value: { [unit: string]: number }
  }[]
  mint: {
    action: string
    quantity: number
    asset: string
    script: Policy
  }[]
  metadata: Metadata
  witnessCount: 2 | number
  invalidAfter: number
  fee?: number
}
interface Wallet {
  payment: {
    skey: string
    vkey: string
  }
  paymentAddr: string
  balance: () => {
    utxo: { txHash: string; txId: string }[]
    value: { [unit: string]: number }
  }
}
export interface mintParams {
  id: string
  type: 'NFT' | 'FT'
  amount: number
  name: string
  description: string
  author: string
  symbol: string
  payment: string
  file: string
  addr: string
  price: number
  paid: boolean
}
const shelleyGenesisPath = '$PATH/cardano/configuration/cardano/mainnet-shelley-genesis.json'
const cardano = new CardanoCliJs({ shelleyGenesisPath })

const tip: number = cardano.queryTip().slot
const keyHash: string = process.env.POLICY_KEY || ''

const wallet: Wallet = cardano.wallet('Constantin')

function createTransaction(tx: Tx): Tx {
  const rawTx = cardano.transactionBuildRaw(tx)
  const fee = cardano.transactionCalculateMinFee({ ...tx, txBody: rawTx })
  console.log('Transaction cost: ', fee)
  tx.txOut[0].value.lovelace -= fee
  return cardano.transactionBuildRaw({ ...tx, fee })
}

const signTransaction = (wallet: Wallet, tx: Tx) => {
  return cardano.transactionSign({
    signingKeys: [wallet.payment.skey, './policy/policy.skey'],
    txBody: tx,
  })
}

function createPolicy(type: 'NFT' | 'FT', keyHash: string, tip: number): [string, Policy] {
  // Include functionality for user to get minting rights, perhaps by sending keys?
  const sig = {
    keyHash: keyHash,
    type: 'sig',
  }
  const policy = {
    type: 'all',
    scripts: [
      sig,
      {
        type: 'before',
        slot: tip + 300,
      },
    ],
  }

  return [cardano.transactionPolicyid(type === 'NFT' ? policy : sig), policy]
}

function createMetadata(assetName: string, policyId: string, optionalMetadata: {}) {
  return {
    721: {
      [policyId]: {
        [assetName]: optionalMetadata,
      },
    },
  }
}

export async function mint({ type, name, description, author, file, amount, addr }: mintParams) {
  const assetName = name.replaceAll(' ', '')
  const artHash = await uploadIpfs(file)
  const [policyId, policy] = createPolicy(type, keyHash, tip)
  const NFT = policyId + '.' + assetName
  const metadata = createMetadata(assetName, policyId, {
    name,
    image: 'ipfs://' + artHash,
    description,
    author,
  })
  const tx = {
    txIn: wallet.balance().utxo,
    txOut: [
      { address: wallet.paymentAddr, value: { ...wallet.balance().value } },
      { address: addr, value: { [NFT]: amount } },
    ],
    mint: [{ action: 'mint', quantity: amount, asset: NFT, script: policy }],
    metadata: metadata,
    witnessCount: 2,
    invalidAfter: tip + 300,
  }
  const raw = createTransaction(tx)
  const signed = signTransaction(wallet, raw)
  const txHash = cardano.transactionSubmit(signed)
  return txHash
}
