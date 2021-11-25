/*
  An example for sending AVAX with this library.
*/

const network = 'mainnet'
// const network = 'fuji'

const networks = require('../lib/networks')
const Wallet = require('../index')

async function sendAvax () {
  try {
    // Replace the values for the constants below to customize for your use.
    const mnemonic =
      'major silly fly prison clerk sense tell vehicle detail captain machine sheriff peasant border admit indoor pill come buyer deny orange mansion bag accuse'

    // If reciever is not specified, the funds will be sent back to the wallet.
    const RECIEVER = ''

    // 1 nAVAX is equal to 0.000000001 AVAX
    const NAVAX_TO_SEND = 10000000

    const wallet = new Wallet(mnemonic, networks[network])
    await wallet.walletInfoPromise

    const outputs = []
    // the assetID is set to avax by default if a value is not given
    outputs.push({ amount: NAVAX_TO_SEND, address: RECIEVER })

    const txid = await wallet.send(outputs)

    console.log(`Success! Avax sent with TXID: ${txid}`)
  } catch (err) {
    console.error('Error: ', err)
  }
}
sendAvax()
