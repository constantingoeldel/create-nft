import { exec } from 'child_process'
import logger from './logging.js'

export default function startChain({
  topology = '~/cardano/configuration/cardano/testnet-topology.json',
  db = '~/cardano/db-testnet',
  socket = '~/cardano/db-testnet/node.socket',
  host = '0.0.0.0',
  port = 3000,
  config = '~/cardano/configuration/cardano/testnet-config.json',
  log = true,
}) {
  return new Promise<number>((resolve, reject) => {
    const chain =
      exec(`cardano-node run --topology ${topology} --database-path ${db} --socket-path ${socket} --host-addr ${host} --port ${port} --config ${config}
    `)
    if (!chain.stdout || !chain.stderr) {
      throw new Error('Not able to launch chain')
    }

    chain.stdout.on('data', (data) => {
      log && console.log(data.toString())
      if (data.toString().includes('Chain extended')) {
        logger.info('Chain started')
        resolve(process.pid)
      }
    })
    chain.stderr.on('data', (data) => {
      if (!data.toString().includes('Listening')) {
        logger.error(data)
        console.log(data.toString())
        chain.pid && process.kill(chain.pid)
        reject(process.pid)
      }
    })
  })
}
