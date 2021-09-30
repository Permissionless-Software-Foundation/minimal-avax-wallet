/*
  An example for listing the Assets and the balances of the wallet.
*/

const Wallet = require('../index')

async function listAssets () {
  try {
    // Replace the values for the constants below to customize for your use.
    const mnemonic =
      'major silly fly prison clerk sense tell vehicle detail captain machine sheriff peasant border admit indoor pill come buyer deny orange mansion bag accuse'

    // Instantiate the wallet library.
    const wallet = new Wallet(mnemonic)

    // Wait for the wallet to be created.
    await wallet.walletInfoPromise

    // Get the token summary
    const assetsInfo = await wallet.listAssets()
    console.log(`Assets in wallet : ${JSON.stringify(assetsInfo, null, 2)}`)
  } catch (err) {
    console.error('Error: ', err)
  }
}
listAssets()
