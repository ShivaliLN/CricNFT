const hre = require("hardhat");
const { assert } = require("chai");
const { ethers } = require("hardhat");
let contract;
let signer0, addr0, Owner;
let signer1, addr1, signer2, addr2;
let token, tokenAddress, cID, token2, tokenAddress2;

describe("CricNFT", function () {
  before(async () => {  
    signer0 = await hre.ethers.provider.getSigner(0);
    addr0 = await signer0.getAddress(); 
    signer1 = await hre.ethers.provider.getSigner(1);
    addr1 = await signer1.getAddress();  
    signer2 = await hre.ethers.provider.getSigner(2);
    addr2 = await signer2.getAddress();          
    
    const Contract = await ethers.getContractFactory("CricnftTeamAgreement");
    contract = await Contract.deploy();
    await contract.deployed();
    console.log("Contract deployed at: "+ contract.address);  
 
  });
  
  describe('Verify Constructor Arguments are set correctly', () => {  
  
    it('should have set signer(0) as Owner ', async () => {
      Owner = await contract.owner();            
      assert.equal((Owner), addr0);
    });     
  }); 

  //

  describe('Owner adds an IPL Team Address to the list', () => {  
  
    it('should have assign role and added to the list', async () => {
      await contract.connect(signer0).setPublishedAddress(addr1); 
    });  
    //getTeamAddressInfo
    it('should have set address to true', async () => {
        const val = await contract.getTeamAddressInfo(addr1); 
        assert.equal(val, true);
    });  
  }); 

  //function createTeamAgreement(uint _teamId, uint _dollarAmount, uint _totalNumOfTokenstoMint, uint _seasonId, string calldata _imageCID) 
  describe('IPL Team Owner creates agreement for seasonid 708 i.e. 2021 season', () => {  
  
    it('should have created agreement', async () => {
      await contract.connect(signer1).createTeamAgreement(777,10,100,708,"QmV46tyKPs6qRnpDWYV9Dxd99CWPCcqw2oYsTGmYJ1nMc4"); 
    });  
    
    it('should have created a new agreement and ID incremented to 1 ', async () => {
        assert.equal((await contract.agreementId()), 1);      
    });
    
    it('should have set team agreement correctly with status as setup', async () => {    
        let {id, publishedAddress, teamId, dollarAmount, totalNumOfTokenstoMint, imageCID, status} = await contract.getAgreementInfo(addr1,1);  
        console.log("****************************************"); 
        console.log(id.toNumber());
        console.log(publishedAddress);
        console.log(teamId.toNumber());
        console.log(dollarAmount.toNumber());
        console.log(totalNumOfTokenstoMint.toNumber());  
        console.log(imageCID); 
        console.log(status); 
        console.log("****************************************");     
      });


  });
});