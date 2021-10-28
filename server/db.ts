import { MongoClient } from 'mongodb'

const mongodb = new MongoClient(process.env.MONGODB_URI!)
await mongodb.connect()
const db = mongodb.db()
const requests = db.collection<mintParams>('requests')
const mints = db.collection<Tx & { policy: string }>('mints')
const payments = db.collection<receivedPayment>('payments')

export { requests, mints, payments }