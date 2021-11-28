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
  return new Promise<number>(async (resolve, reject) => {
    const pid = await isChainRunning()
    if (pid) {
      console.log('Chain is already running')
      return resolve(pid)
    }
    const chain =
      exec(`cardano-node run --topology ${topology} --database-path ${db} --socket-path ${socket} --host-addr ${host} --port ${port} --config ${config}
    `)
    if (!chain.stdout || !chain.stderr) {
      throw new Error('Not able to launch chain')
    }

    chain.stdout.on('data', (data) => {
      log && console.log(data.toString())
      if (data.toString().includes('Chain extended')) {
        logger.info('Chain extended')
        return resolve(process.pid)
      }
    })
    chain.stderr.on('data', (data) => {
      if (!data.toString().includes('Listening')) {
        logger.error(data)
        chain.pid && process.kill(chain.pid)
        return reject(process.pid)
      }
    })
  })
}
function isChainRunning(): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    exec('ps -ax | grep cardano-node', (err, stdout: string) => {
      if (err) reject(err.toString())
      const pid = stdout.includes('run') ? Number(stdout.split(' ')[2]) : 0
      return resolve(pid)
    })
  })
}
