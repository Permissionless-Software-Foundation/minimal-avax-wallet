/*
  An example for listing the UTXOs held by a wallet.
*/

const network = 'mainnet'
// const network = 'fuji'

const networks = require('../lib/networks')
const Wallet = require('../index')

async function listUtxos () {
  try {
    // Replace the values for the constants below to customize for your use.
    const mnemonic =
      'major silly fly prison clerk sense tell vehicle detail captain machine sheriff peasant border admit indoor pill come buyer deny orange mansion bag accuse'

    // Instantiate the wallet library.
    const wallet = new Wallet(mnemonic, networks[network])

    // Wait for the wallet to be created.
    await wallet.walletInfoPromise

    // Get the assets summary
    const utxoInfo = await wallet.getUtxos()
    console.log(`UTXOs in wallet : ${JSON.stringify(utxoInfo, null, 2)}`)
  } catch (err) {
    console.error('Error: ', err)
  }
}
listUtxos()
