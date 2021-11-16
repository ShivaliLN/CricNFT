// Name the file `retrieve.mjs` so you can use `import` with nodejs  
// Run `npm i web3.storage` to install this package
import { Web3Storage } from 'web3.storage'
require('dotenv').config()

const token = process.env.WEB3STORAGE_API_KEY
const client = new Web3Storage({ token })

async function retrieveFiles () {
  const cid =
    'bafybeidd2gyhagleh47qeg77xqndy2qy3yzn4vkxmk775bg2t5lpuy7pcu'
  // You can fetch data using any CID, even from IPFS Nodes or Gateway URLs!
  const res = await client.get(cid)
  const files = await res.files()

  for (const file of files) {
    console.log(`${file.cid}: ${file.name} (${file.size} bytes)`)
  }
}

retrieveFiles()
// Now run it with 
// API_TOKEN=YOUR_TOKEN_HERE node ./retrieve.mjs 
