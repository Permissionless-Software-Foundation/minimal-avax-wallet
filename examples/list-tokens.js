/*
  An example for listing the tokens and token balances of the wallet.
*/

const Wallet = require('../index')

async function listTokens () {
  try {
    // Replace the values for the constants below to customize for your use.
    const MNEMONIC =
      'cluster brick purpose service rocket trigger sketch icon grow fine panda gym expand track later situate swim marble flip child roast tent father fade'

    // Instantiate the wallet library.
    const wallet = new Wallet(MNEMONIC)

    // Wait for the wallet to be created.
    await wallet.walletInfoPromise

    // Get the token summary
    const tokenInfo = await wallet.listTokens()
    console.log(`tokenInfo: ${JSON.stringify(tokenInfo, null, 2)}`)
  } catch (err) {
    console.error('Error: ', err)
  }
}
listTokens()