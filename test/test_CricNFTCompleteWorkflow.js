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
    signer4 = await hre.ethers.provider.getSigner(4);
    addr4 = await signer4.getAddress(); 
    signer5 = await hre.ethers.provider.getSigner(5);
    addr5 = await signer5.getAddress(); 
    signer6 = await hre.ethers.provider.getSigner(6);
    addr6 = await signer6.getAddress();   
    
    const Contract = await ethers.getContractFactory("CricNFTTeamAgreement");
    contract = await Contract.deploy();
    await contract.deployed();
    console.log("Contract deployed at: "+ contract.address);  

    const Contract3 = await ethers.getContractFactory("CricNFTGetAPIData");
    contract3 = await Contract3.deploy(contract.address);
    await contract3.deployed();
    console.log("Contract3 deployed at: "+ contract3.address);  

    const Contract2 = await ethers.getContractFactory("CricNFTMint");
    contract2 = await Contract2.deploy(contract.address,contract3.address);
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
        await contract.connect(signer0).setPublishedAddress(addr4);   //add one more IPL Team Owner
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
        await contract.connect(signer1).createTeamAgreement(777,ethers.utils.parseEther("0.1"),100,708); //first
      });       
      //signer4
     it('should have created agreement 2', async () => {
      await contract.connect(signer4).createTeamAgreement(123,ethers.utils.parseEther("0.013"),200,708); // second 
    });   
     });        
    

     //function addToken(uint _id, bytes _imageURL,string calldata _cid) public isAuthorized(_id){

      describe('IPL Team owner is able to add token', () => {  
        //signer1
          it('should have added token', async () => {
             await contract2.connect(signer1).addToken(1, "bafkreih7ofimyplwb446rsyllqdpebmpzb5dlag5nbvpenbvcxp7tyvb7i","QmV46tyKPs6qRnpDWYV9Dxd99CWPCcqw2oYsTGmYJ1nMc4");
          });

          //signer4
          it('should have added token 2', async () => {
            await contract2.connect(signer4).addToken(2, "bafkreih7ofimyplwb446rsyllqdpebmpzb5dlag5nbvpenbvcxp7tytest","QmV46tyKPs6qRnpDWYV9Dxd99CWPCcqw2oYsTGmYJ1nMd5");
         });
          
          it('should have set values correctly', async () => {
            let val1;
            let val2;
           [val1, val2] = await contract2.connect(signer1).querySupplyLeftRate(1); 
           console.log(val1.toNumber());
           console.log(ethers.utils.formatEther(val2));
          });
          
          it('Unauthorized person trying to add token id 1', async () => {
            
            await contract2.connect(signer3).addToken(1,"bafkreih7ofimyplwb446rsyllqdpebmpzb5dlag5nbvpenbvcxp7tyvb7i","QmV46tyKPs6qRnpDWYV9Dxd99CWPCcqw2oYsTGmYJ1nMc4");
          });

          it('Trying to withdraw when balance is 0 i.e. no NFT minted for token id 1', async () => {
               await contract2.connect(signer1).withdraw(1);
          });
      });

      describe('ERC1155 Token is available for mint', () => {  
        //signer3
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
          //Token 2
          it('should mint tokens 2 to general public', async () => {
            await contract2.connect(signer3).mint(2,24, {value:ethers.utils.parseEther("0.377")});
        });

        it('should mint tokens 2 to general public', async () => {                                //test to check if user can only mint upto 25 NFT/tokenId
          await contract2.connect(signer3).mint(2,1, {value:ethers.utils.parseEther("0.377")});
        });
        
        it('should have increased balance of signer3 for tokenid 2', async () => {
          let val1;           
         val1 = await contract2.connect(signer3).balanceOf(addr3,2); 
         console.log(val1.toNumber());           
        }); 

        //function querySupplyLeftRate(uint256 _tokenId) external view returns (uint _supply, uint _rate)
        it('query remaining supply', async () => {
          let val1; 
          let val2;          
          [val1, val2] = await contract2.querySupplyLeftRate(2); 
         console.log(val1.toNumber()); 
         console.log(ethers.utils.formatEther(val2));          
        }); 
      });

      describe('One more user mint token1 and token 2', () => {  
        //signer5
          it('should mint tokens to general public', async () => {
              await contract2.connect(signer5).mint(1,2, {value:ethers.utils.parseEther("0.2")});
              await contract2.connect(signer5).mint(2,13, {value:ethers.utils.parseEther("0.169")});
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
/*
        //signer0
        it('contract owner trying to withdraw balance, should allow', async () => {
          await contract2.connect(signer0).ownerWithdraw();
          let balance = await signer0.getBalance();
          console.log("Contract Owner after Balance:" + ethers.utils.formatEther(balance) + "(ETH)" );           
        }); 
*/        
      });

      describe('Setting winner team and claim share', () => {  
        //signer0
        it('should set season winner to token 2', async () => {
          await contract3.connect(signer0).setMatchWinner(2);
          const value = await contract3.getMatchWinner(708);
          console.log("winner tokenid: " + value)
        });

        //signer3
        it('should NOT allow claim share for token 1', async () => {
         // console.log(await signer3.getBalance());
          await contract2.connect(signer3).claimShare(708,1);
         // console.log(await signer3.getBalance());
        });

        //signer3
        it('should allow claim share for token 2 and increase ETH balance of user', async () => {
          console.log(ethers.utils.formatEther(await signer3.getBalance()));
          await contract2.connect(signer3).claimShare(708,2);
          console.log(ethers.utils.formatEther(await signer3.getBalance()));
        });

        //signer3
        it('should NOT allow claim share for token 2 again', async () => {
          console.log(ethers.utils.formatEther(await signer3.getBalance()));
          await contract2.connect(signer3).claimShare(708,2);
          console.log(ethers.utils.formatEther(await signer3.getBalance()));
        });

        //signer5
        it('should allow 2nd user claim share for token 2 and increase ETH balance of user', async () => {
          console.log(ethers.utils.formatEther(await signer3.getBalance()));
          await contract2.connect(signer5).claimShare(708,2);
          console.log(ethers.utils.formatEther(await signer3.getBalance()));          
        });

        //signer0
        it('contract owner trying to claim share for NFT that they dont own', async () => {          
          await contract2.connect(signer0).claimShare(708,2);                   
        });
      });

  }); 