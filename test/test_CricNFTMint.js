const hre = require("hardhat");
const { assert } = require("chai");
const { ethers } = require("hardhat");
let contract;
let contract2;
let signer0, addr0, Owner;
let signer1, addr1, signer2, addr2, signer3, addr3;
let token, tokenAddress, cID, token2, tokenAddress2;

describe("CricNFTMint", function () {
  before(async () => {  
    signer0 = await hre.ethers.provider.getSigner(0);
    addr0 = await signer0.getAddress(); 
    signer1 = await hre.ethers.provider.getSigner(1);
    addr1 = await signer1.getAddress();  
    signer2 = await hre.ethers.provider.getSigner(2);
    addr2 = await signer2.getAddress(); 
    signer3 = await hre.ethers.provider.getSigner(3);
    addr3 = await signer3.getAddress();         
    
    const Contract = await ethers.getContractFactory("CricNFTTeamAgreement");
    contract = await Contract.deploy();
    await contract.deployed();
    console.log("Contract deployed at: "+ contract.address);  

    const Contract2 = await ethers.getContractFactory("CricNFTMint");
    contract2 = await Contract2.deploy(contract.address);
    await contract2.deployed();
    console.log("Contract2 deployed at: "+ contract2.address);  
    });

    describe('Verify Constructor Arguments are set correctly', () => {  
  
      it('should have set signer(0) as Owner ', async () => {
        Owner = await contract.owner();            
        assert.equal((Owner), addr0);
      });  
    });

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
  
    //function createTeamAgreement(uint _teamId, uint _price, uint _totalNumOfTokenstoMint, uint _seasonId, string calldata _imageCID) 
    describe('IPL Team Owner creates agreement for seasonid 708 i.e. 2021 season', () => {  
    //signer1
      it('should have created agreement', async () => {
        await contract.connect(signer1).createTeamAgreement(777,ethers.utils.parseEther("0.1"),100,708,"QmV46tyKPs6qRnpDWYV9Dxd99CWPCcqw2oYsTGmYJ1nMc4"); 
      });       
     });

     //function addToken(uint _id, string calldata _cid) public isAuthorized(_id){

      describe('IPL Team owner is able to add token', () => {  
        //signer1
          it('should have added token', async () => {
            //await contract2.connect(signer1).addToken(1,10,100,"QmV46tyKPs6qRnpDWYV9Dxd99CWPCcqw2oYsTGmYJ1nMc4"); 
            await contract2.connect(signer1).addToken(1,"QmV46tyKPs6qRnpDWYV9Dxd99CWPCcqw2oYsTGmYJ1nMc4");
          });
          
          it('should have set values correctly', async () => {
            let val1;
            let val2;
           [val1, val2] = await contract2.connect(signer1).querySupplyLeftRate(1); 
           console.log(val1.toNumber());
           console.log(ethers.utils.formatEther(val2));
          });
          
          it('Unauthorized person trying to add token id 1', async () => {
            //await contract2.connect(signer1).addToken(1,10,100,"QmV46tyKPs6qRnpDWYV9Dxd99CWPCcqw2oYsTGmYJ1nMc4"); 
            await contract2.connect(signer3).addToken(1,"QmV46tyKPs6qRnpDWYV9Dxd99CWPCcqw2oYsTGmYJ1nMc4");
          });

          it('Trying to withdraw when balance is 0 i.e. no NFT minted for token id 1', async () => {
               await contract2.connect(signer1).withdraw(1);
          });
      });

      describe('ERC1155 Token is available for mint', () => {  
        //signer1
          it('should mint tokens to general public', async () => {
              await contract2.connect(signer3).mint(1,25, {value:ethers.utils.parseEther("2.5")});
          });
          
          it('should have increased balance of signer3 for tokenid 1', async () => {
            let val1;           
           val1 = await contract2.connect(signer3).balanceOf(addr3,1); 
           console.log(val1.toNumber());           
          }); 

          //function querySupplyLeftRate(uint256 _tokenId) external view returns (uint _supply, uint _rate)
          it('query remaining supply', async () => {
            let val1; 
            let val2;          
            [val1, val2] = await contract2.querySupplyLeftRate(1); 
           console.log(val1.toNumber()); 
           console.log(ethers.utils.formatEther(val2));          
          }); 

          it('Query Invalid token id', async () => {
            let val1; 
            let val2;          
            [val1, val2] = await contract2.querySupplyLeftRate(2); 
           console.log(val1.toNumber()); 
           console.log(ethers.utils.formatEther(val2));          
          }); 
      });

      describe('IPL Team Owner Withdraws money for token id 1', () => {  
        //signer0
        it('contract owner trying to withdraw token id 1 balance, should NOT allow', async () => {
          let balance = await signer0.getBalance();
          console.log("Contract Owner Balance:" + ethers.utils.formatEther(balance) + "(ETH)" );
          await contract2.connect(signer0).withdraw(1); 
        }); 
        
        //signer1
          it('should have transfered the amount to IPL team owner', async () => {
            let balance = await signer1.getBalance();
            console.log("IPL Team Owner Before Balance:" + ethers.utils.formatEther(balance) + "(ETH)" );
            await contract2.connect(signer1).withdraw(1);
            balance = await signer1.getBalance();
            console.log("IPL Team Owner After Balance:" + ethers.utils.formatEther(balance)+ "(ETH)"); 
          }); 
          
          it('Trying to withdraw again, should error out', async () => {
            let balance = await signer1.getBalance();
            //console.log("Before Balance:" + ethers.utils.formatEther(balance) + "(ETH)" );
            await contract2.connect(signer1).withdraw(1);            
          });

          it('Balance of the owner of the contract', async () => {
            let balance = await signer0.getBalance();
            console.log("Contract owner before balance:" + ethers.utils.formatEther(balance) + "(ETH)" );          
          });

        //signer0
        it('contract owner trying to withdraw balance, should allow', async () => {
          await contract2.connect(signer0).ownerwithdraw();
          let balance = await signer0.getBalance();
          console.log("Contract Owner after Balance:" + ethers.utils.formatEther(balance) + "(ETH)" );           
        }); 
      });

  }); 