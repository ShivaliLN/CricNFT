// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "contracts/CricNFTTeamAgreement.sol";
import "contracts/CricNFTGetAPIData.sol";

/**
 * @title CricNFTMint (STEP 3 CONTRACT)
 * @notice Once the agreement has been created by authrorized IPL team and NFT "properties" has been fetched using API, time to add tokenId to have it avilable for minting by general public
 * @author Shivali Sharma @ Chainlink Fall Hackathon 2021 
 **/

contract CricNFTMint is ERC1155, AccessControl {
    
    using SafeMath for uint;

    uint256[] public tokens;
    uint256[] public supplies;
    uint256[] public minted;
    uint256[] public rates;
    address public owner;

    mapping(uint => string) tokenURIs;
    mapping(uint => address) iplTeamOwners; //tokenid to IPL Team Owner
    mapping(address => uint) balances;      // IPL Team Owner balance
    //mapping(uint => mapping(address => bool)) winnerPayout;      // tokenid to NFT holder to bool
    
    CricNFTTeamAgreement teamAgreement;
    //CricNFTGetAPIData getAPIData;

    event TokenAdded(uint _id, uint _supply, uint _rate, string _cid);
    event Withdraw(address teamOwner, uint tokenId, uint amount);
    event NewOwner(address _newowner);

    constructor(address _cricnftTeamAgreement) ERC1155("https://gateway.pinata.cloud/ipfs/{CID}") {
        owner = msg.sender;
        teamAgreement = CricNFTTeamAgreement(_cricnftTeamAgreement);        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        //getAPIData=CricNFTGetAPIData(address());  
    }
    
  /**
  @notice Once the metadata of the NFT has been uploaded on IPFS/Filecoin, this function is called to add the token by IPL Team Owner
  @dev Set supply, minted and rate arrays. Date coming from CricNFTTeamAgreement contract
  @param _id uint
  @param _cid cid
  **/
    function addToken(uint _id, string calldata _cid) public isAuthorized(_id){
      (, , , uint price, uint totalNumOfTokenstoMint, , , ) = teamAgreement.getAgreementInfo(msg.sender, _id);
        tokens.push(_id);
        supplies.push(totalNumOfTokenstoMint);
        minted.push(0);
        rates.push(price);
        //example: tokenURIs[1]="QmU7fyhpadQEouGUohCAiZ4e7NxfujFKbieHAPKESe6jt9";
        tokenURIs[_id]=_cid;
        iplTeamOwners[_id]=msg.sender;
        // make Team Agreement status live
        emit TokenAdded(_id, totalNumOfTokenstoMint, price, _cid);
    }

/**
  @notice ERC1155 Mint Function to mint the NFT
  @param id uint
  @param amount uint
**/

    function mint(uint256 id, uint256 amount)
        public
        payable
    {
        require(id <= supplies.length, "Invalid Token Id" );
        require(id > 0, "Invalid Token Id");
        uint index = id-1;
        require(minted[index]+ amount <= supplies[index], "Not enough supply");
        require(msg.value >= amount * rates[index], "Not enough ether sent");
        
        uint value = msg.value;
        uint contractShare = SafeMath.div(value,100);       // 1% contract share 
        balances[owner]+= contractShare;
        console.log(contractShare);
        
        address _teamOwner = iplTeamOwners[id];
        balances[_teamOwner]+=SafeMath.sub(value,contractShare);
        console.log(balances[_teamOwner]);

        _mint(msg.sender, id, amount, "");
        minted[index] += amount;
        
    }

 /**
  @notice set correct URI based on the token id
  @param _tokenId uint
**/

    function uri(uint256 _tokenId) override public view returns (string memory){
        string memory _cid=tokenURIs[_tokenId];
        return string(abi.encodePacked("https://gateway.pinata.cloud/ipfs/",_cid));
    }

 /**
  @notice Function to allow users to query the remaining supply and rate
  @param _tokenId uint
**/
    function querySupplyLeftRate(uint256 _tokenId) external view returns (uint _supply, uint _rate){
            require(iplTeamOwners[_tokenId] != address(0), "Invalid TokenId");
            uint index = _tokenId-1;
            _supply = supplies[index]-minted[index];
            _rate = rates[index];
    }

    
    function changeOwnership(address _newowner) external onlyRole(DEFAULT_ADMIN_ROLE){
        owner = _newowner;
        emit NewOwner(_newowner);
    }

/**
  @notice Function to allow IPL Team Owners to withdraw the amount for their NFTs minted
  @param _tokenId uint
**/

    function withdraw(uint _tokenId) public isAuthorized(_tokenId){
            require(balances[msg.sender] > 0, "Insufficient Funds");
            uint amount = balances[msg.sender];
            balances[msg.sender]=0;
            //payable(msg.sender).transfer(amount);
            (bool success, ) = (msg.sender).call{value: amount}("");
            require(success, "Transfer failed.");
            emit Withdraw(msg.sender, _tokenId, amount);
    }

/**
  @notice Function to allow contract owner to withdraw contract share for each NFT purchased. 
  This function might get replated with claimShare() to allow winning team NFT holders to claim their share
**/
   function ownerwithdraw() public onlyRole(DEFAULT_ADMIN_ROLE){
            require(balances[msg.sender] > 0, "Insufficient Funds");
            uint amount = balances[msg.sender];
            balances[msg.sender]=0;
            //payable(msg.sender).transfer(amount);
            (bool success, ) = (msg.sender).call{value: amount}("");
            require(success, "Transfer failed.");
    }


/**
  @notice Function to allow winning team NFT holders to claim their share. This function needs to be thoroughly reviewed before making it available for public
**/
    /*
    function claimShare(uint _tokenId) external {
            require(getAPIData.matchResults[708] > 0, "Match winner not declared yet.");        //season id to winning token id
            require(balanceOf(msg.sender, _tokenId) > 0, "You are not the owner of winnig team.");
            require(winnerPayout[_tokenId][msg.sender]==false, "You have already claimed your share");
            uint amount = balances[owner];
            uint totalTokensMinted = minted[_tokenId];
            uint sharePerNFT = SafeMath.div(amount,totalTokensMinted);
            
            winnerPayout[_tokenId][msg.sender]=true;
            uint numberOfNFTHolder = balanceOf(msg.sender, _tokenId);
            uint value = amount - (sharePerNFT * numberOfNFTHolder);
            balances[owner]-=value;
            (bool success, ) = (msg.sender).call{value: value}("");
            require(success, "Transfer failed.");
            emit Claimed(msg.sender, _tokenId, value);
    }
    */


    // The following functions are overrides required by Solidity.

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }    

    modifier isAuthorized(uint _tokenId){
        if(teamAgreement.isAuthorizedOwner(msg.sender, _tokenId)){
            _;
        }else {
            revert("Not Authorized to perform this action");
        }

    }   

}
