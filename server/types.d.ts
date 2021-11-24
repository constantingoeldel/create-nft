declare module 'unirest'
declare module 'cardanocli-js'

declare interface receivedPayment {
  amount: number
  payer: string
}

declare interface utxo {
  txHash: string
  index: number
  amount: number
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
  mint?: {
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
declare type mintParams =
  | {
      timestamp: number
      id: string
      type: 'NFT'
      amount: number
      properties: properties
      addr: string
      price: number
      paid: boolean
      minted: false | string
      policy?: string
      file?: string

      status: 'pending' | 'paid' | 'minted' | 'failed'
    }
  | {
      timestamp: number
      id: string
      type: 'FT'
      properties: properties
      amount: number
      addr: string
      price: number
      paid: boolean
      minted: false | string
      policy?: string
      file?: string

      status: 'pending' | 'paid' | 'minted' | 'failed'
    }

declare interface request {
  auth: string
  amount?: number
  properties: properties
}

declare interface customer {
  token: string
  paymentAddr: string
  id: string
  createdAt: number
}

declare interface properties {
  name: string
  description?: string
  author?: string
  symbol?: string
  [property: string]: string
}
