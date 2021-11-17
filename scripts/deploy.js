
const hre = require("hardhat");

async function main() {
  const signer0 = await hre.ethers.provider.getSigner(0);
  const addr0 = await signer0.getAddress();

  //const Contract = await hre.ethers.getContractFactory("CricnftTeamAgreement");
  //const contract = await Contract.deploy();
  //await contract.deployed();
  
  //console.log("CricnftTeamAgreement Contract deployed to:", contract.address);

  const Contract2 = await hre.ethers.getContractFactory("CricNFTGenerate");
  const contract2 = await Contract2.deploy("0x96D0F47A6503266783237AFDBC00119c986dc0C8");
  await contract2.deployed();
  console.log("CricNFTGenerate Contract deployed to:", contract2.address);

}


main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
