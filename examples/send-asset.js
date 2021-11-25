/*
  An example for sending ANT with this library.
*/

const network = 'mainnet'
// const network = 'fuji'

const networks = require('../lib/networks')
const Wallet = require('../index')

async function sendAsset () {
  try {
    // Replace the values for the constants below to customize for your use.
    const mnemonic =
      'major silly fly prison clerk sense tell vehicle detail captain machine sheriff peasant border admit indoor pill come buyer deny orange mansion bag accuse'

    // If reciever is not specified, the funds will be sent back to the wallet.
    const RECIEVER = ''

    const ASSET_AMOUNT = 190
    // const assetID = 'U8iRqJoiJm8xZHAacmvYyZVwqQx6uDNtQeP3CQ6fcgQk3JqnK' //fuji
    const assetID = '2jgTFB6MM4vwLzUNWFYGPfyeQfpLaEqj4XWku6FoW7vaGrrEd5'

    const wallet = new Wallet(mnemonic, networks[network])
    await wallet.walletInfoPromise

    const outputs = []
    // In order to send an asset it's *required* to specify the id
    // otherwise the wallet will send AVAX instead
    outputs.push({ amount: ASSET_AMOUNT, assetID, address: RECIEVER })

    const txid = await wallet.send(outputs)

    console.log(`Success! Asset sent with TXID: ${txid}`)
  } catch (err) {
    console.error('Error: ', err)
  }
}
sendAsset()
