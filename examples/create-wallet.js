/*
  An example app for creating a wallet using this library.

  This wallet can be imported into the AVAX web wallet:
  https://wallet.avax.network
*/

const network = 'mainnet'
// const network = 'fuji'

const networks = require('../lib/networks')
const AvaxWallet = require('../index')

async function createWallet () {
  try {
    // Instantiate the wallet library.
    const avaxWallet = new AvaxWallet(null, networks[network])

    // Wait for the wallet to be created.
    await avaxWallet.walletInfoPromise

    // Print out the wallet information.
    console.log(
      `Wallet information: ${JSON.stringify(avaxWallet.walletInfo, null, 2)}`
    )
  } catch (err) {
    console.error('Error: ', err)
  }
}
createWallet()
