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
    
    const Contract = await ethers.getContractFactory("CricNFTTeamAgreement");
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

  //function createTeamAgreement(uint _teamId, uint _price, uint _totalNumOfTokenstoMint, uint _seasonId) 
  describe('IPL Team Owner creates agreement for seasonid 708 i.e. 2021 season', () => {  
  //signer1
    it('should have created agreement', async () => {
      await contract.connect(signer1).createTeamAgreement(777,10,100,708); 
    });  
    
    it('should have created a new agreement and ID incremented to 1 ', async () => {
        assert.equal((await contract.agreementId()), 1);      
    });
    
    it('should have set team agreement correctly with status as setup', async () => {    
        let {id, publishedAddress, teamId, price, totalNumOfTokenstoMint, status} = await contract.getAgreementInfo(addr1,1);  
        console.log("****************************************"); 
        console.log("Agreement ID (Token ID): " + id.toNumber());
        console.log("IPL Team Published Address:" + publishedAddress);
        console.log("IPL Team ID:" + teamId.toNumber());
        console.log("Price for NFT (Floor Price):" + price.toNumber() + " (ETH)");
        console.log("Total number of NFTs:" + totalNumOfTokenstoMint.toNumber());           
        console.log("Agreement Status"+ status); 
        console.log("****************************************");     
      });
  });

  describe('Unauthorized user tries to create agreement', () => {  
    //signer2
    it('should NOT have created agreement', async () => {
      await contract.connect(signer2).createTeamAgreement(777,10,100,708); 
    });    
  });

  describe('IPL Team Owner tries to creates multiple agreements for seasonid 708 for different Team id', () => {  
    //signer1
    it('should NOT allow to create agreement', async () => {
      await contract.connect(signer1).createTeamAgreement(123,10,100,708); 
    });    
  });

  describe('IPL Team Owner tries to creates agreements again for their team', () => {  
    //signer1
    it('should NOT allow to create agreement', async () => {
      await contract.connect(signer1).createTeamAgreement(777,10,100,708);
    });    
  });
});
