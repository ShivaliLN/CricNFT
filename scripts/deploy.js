
const hre = require("hardhat");

async function main() {
 
  const signer0 = await hre.ethers.provider.getSigner(0);
  const addr0 = await signer0.getAddress();

  const Contract = await hre.ethers.getContractFactory("CricNFTTeamAgreement");
  const contract = await Contract.deploy();
  await contract.deployed();
  
  console.log("CricnftTeamAgreement Contract deployed to:", contract.address);


// For Polygon mumbai use below for contract2
  const Contract2 = await hre.ethers.getContractFactory("CricNFTGetAPIData");
  const contract2 = await Contract2.deploy(contract.address, {
    gasLimit: 4500000
  });
  await contract2.deployed();
  console.log("CricNFTGetAPIData Contract deployed to:", contract2.address);


  const Contract3 = await hre.ethers.getContractFactory("CricNFTMint");
  const contract3 = await Contract3.deploy(contract.address, contract2.address);
  //const contract3 = await Contract3.deploy("0x31810884311A857c827f8f354c3724f5397FF6b3", "0xA089B7AEb2fb4E9D5Fb193980e2940cfF59AADa6");
  await contract3.deployed();
  console.log("CricNFTMint Contract deployed to:", contract3.address);


/*
const Contract2 = await hre.ethers.getContractFactory("CricNFTGetAPIData");
  const contract2 = await Contract2.deploy(contract.address);
  await contract2.deployed();
  console.log("CricNFTGetAPIData Contract deployed to:", contract2.address);
*/  

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
