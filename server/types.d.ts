declare module 'unirest'
declare module 'cardanocli-js'

declare interface receivedPayment {
  amount: number
  payer: string
}

declare interface Policy {}

declare interface Metadata {
  721: {
    [policyId: string]: {
      [assetName: string]: {}
    }
  }
}
declare interface Tx {
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
declare interface Wallet {
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
declare interface mintParams {
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
  minted: false | string
  policy: string
}
