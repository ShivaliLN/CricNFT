// Name the file `store.mjs` so you can use `import` with nodejs 
// Run `npm i web3.storage` to install this package
import { Web3Storage, getFilesFromPath } from 'web3.storage'
require('dotenv').config()

const token = process.env.WEB3STORAGE_API_KEY
const client = new Web3Storage({ token })

async function storeFiles () {
  const files = await getFilesFromPath('/path/to/file')
  const cid = await client.put(files)
  console.log(cid)
}

storeFiles()
// Now run it with 
// API_TOKEN=YOUR_TOKEN_HERE node ./store.mjs
