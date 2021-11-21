require('dotenv').config()
const ethers = require('ethers');
const ContractArtifact = require('/Users/dhana/Documents/GitHub/Cricnft/src/artifacts/contracts/CricnftTeamAgreement.sol/CricnftTeamAgreement.json');
const Contract2Artifact = require('/Users/dhana/Documents/GitHub/Cricnft/src/artifacts/contracts/CricNFTGenerate.sol/CricNFTGenerate.json');

// TO DO: Copy-paste your Alchemy Kovan HTTP Endpoint
const url = process.env.KOVAN_URL; 

// connect to JSON-RPC provider
const provider = new ethers.providers.JsonRpcProvider(url);

// import private key from .env file and initialize a wallet
const privateKey = process.env.PRIVATE_KEY;
let wallet = new ethers.Wallet(privateKey, provider);
wallet = wallet.connect(provider);

//addresses and ABIs necessary
const contractAddress = "0x96D0F47A6503266783237AFDBC00119c986dc0C8";
//const contractAddress = process.env.CONTRACT_ADDRESS
const contractABI = ContractArtifact.abi;

//addresses and ABIs necessary
const contractAddress2 = "0xE868fa419604aDB30984f9cc40F218c648bB2be0";
//const contractAddress = process.env.CONTRACT_ADDRESS
const contractABI2 = Contract2Artifact.abi;


// connect contract to its abi so that we can communicate with it via this instance
const contract = new ethers.Contract(contractAddress, contractABI, wallet);
const contract2 = new ethers.Contract(contractAddress2, contractABI2, wallet);

// start of async function where we will make the function call
async function main() {

  //connect contract instance to wallet and call markTrainingCompleted() function
    
    //const userAdd="0xa8b2586165fCf2138282b724e9F6E6509532c6B3";
    //const tokenAdderss = "0x6c0e31d6D129052a77B00834285Dfb331c04ca02";
    //const tx = await contract.markTrainingCompleted(userAdd, tokenAdderss, {gasLimit:200000} )
    //console.log("Access granted");
    const agreementId = await contract.agreementId()
    console.log("agreementId " + agreementId)

    const resultValue = await contract2.resultValue()
    console.log("resultValue " + resultValue)
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
});