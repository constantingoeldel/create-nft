import { MongoClient } from 'mongodb'
import { requests as requestsMem } from './server.js'

const mongodb = new MongoClient(process.env.MONGODB_URI!)
await mongodb.connect()
const db = mongodb.db()
const requests = db.collection<mintParams>('requests')
const mints = db.collection<Tx & { hash: string; id: string; policy: string }>('mints')
const payments = db.collection<receivedPayment>('payments')
const customers = db.collection<customer>('customers')

function updateStatus(id: string, status: 'pending' | 'paid' | 'minted' | 'failed') {
  requestsMem.forEach((request) => {
    if (request.id == id) request.status = status
    return request
  })
  requests.updateOne({ id }, { $set: { status } })
}

export { requests, mints, payments, customers, updateStatus }
