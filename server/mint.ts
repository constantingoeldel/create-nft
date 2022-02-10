import { config } from 'dotenv'
import uploadIpfs from './ipfs.js'
import { cardano } from './server.js'
import logger from './logging.js'
import { blockfrost} from './utxos.js'

config()

const mintDeduction = 2_000_000
const keyHash: string = process.env.POLICY_KEY || ''
const receivingAddr: string = process.env.DEV!
  ? process.env.TESTNET_ADDR!
  : process.env.STANDARD_ADDR!

export async function mint({ walletId, type, properties, file, amount, addr, price }: mintParams) {
  const tip: number = cardano.queryTip().slot
  const wallet = cardano.wallet(walletId)

  const assetName = properties.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/([^\w]+|\s+)/g, '')
    .replace(/(^-+|-+$)/, '')
  const artHash = file ? await uploadIpfs(file) : ''
  const [policyId, policy] = createPolicy(type, keyHash, tip)
  const NFT = policyId + '.' + assetName
  const metadata = createMetadata(assetName, policyId, {
    image: 'ipfs://' + artHash,
    ...properties,
  })
  const tx = {
    txIn:
      walletId.length === 21
        ? wallet.balance().utxo
        : wallet
            .balance()
            .utxo.filter((utxo: { value: { lovelace: number } }) => utxo.value.lovelace === price),
    txOut: [
      {
        address: walletId.length === 21 ? wallet.paymentAddr : receivingAddr,
        value: {
          lovelace: wallet.balance().value.lovelace - mintDeduction,
        },
      },
      { address: addr, value: { lovelace: mintDeduction, [NFT]: amount } },
    ],
    mint: [{ action: 'mint', quantity: amount, asset: NFT, script: policy }],
    metadata: metadata,
    witnessCount: 2,
    invalidAfter: tip + 300,
  }
  const raw = createTransaction(tx)
  const signed = signTransaction(wallet, raw)
  logger.info({ message: 'Transaction ready to be submitted', raw: raw, signed: signed })
  const result = await blockfrost.txSubmit(signed)
  console.log(result)
  logger.info({ message: 'Transaction submitted', result })
  const txHash = result
  // const txHash: string = cardano.transactionSubmit(signed)
  txHash &&
    logger.info({
      message: 'Minting successful, transaction hash: ' + txHash,
      txHash: txHash,
      type: 'SUCCESS',
    })
  return { txHash, tx, policy: NFT }
}

function createTransaction(tx: Tx): Tx {
  const rawTx = cardano.transactionBuildRaw(tx)
  const fee = cardano.transactionCalculateMinFee({ ...tx, txBody: rawTx })
  logger.info('Transaction cost: ' + fee)
  // @ts-ignore
  tx.txOut[0].value.lovelace -= fee
  return cardano.transactionBuildRaw({ ...tx, fee })
}

function signTransaction(wallet: Wallet, tx: Tx) {
  return cardano.transactionSign({
    signingKeys: [wallet.payment.skey, './policy/policy.skey'],
    txBody: tx,
  })
}

function createPolicy(type: 'NFT' | 'FT', keyHash: string, tip: number): [string, Policy] {
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

  return [cardano.transactionPolicyid(policy), policy]
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
