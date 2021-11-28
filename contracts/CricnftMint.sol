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
 * @notice Once the agreement has been created by authrorized IPL team and NFT "properties" has been fetched using API, 
 * Add tokenId to have it avilable for minting by general public
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
    mapping(address => mapping(uint=> bool)) tokenForSeason; //IPL Team Owner => season id => bool
    mapping(address => uint) balances;      // IPL Team Owner balance
    mapping(uint => mapping(address => bool)) winnerPayout;      // tokenid to NFT holder to bool
    
    CricNFTTeamAgreement teamAgreement;
    CricNFTGetAPIData getAPIData;

    event TokenAdded(uint indexed id, uint supply, uint indexed rate , string indexed imageCID, string cid);  
    event Withdraw(address indexed teamOwner, uint tokenId, uint amount);
    event NewOwner(address newowner);    
    event Minted(address indexed user,uint indexed tokenId, uint indexed quantity);
    event Claimed(address indexed user, uint indexed _tokenId, uint indexed value);


    constructor(address _cricnftTeamAgreement, address _getAPIData) ERC1155("https://gateway.pinata.cloud/ipfs/{CID}") {
        owner = msg.sender;
        teamAgreement = CricNFTTeamAgreement(_cricnftTeamAgreement);    
        getAPIData=CricNFTGetAPIData(_getAPIData); 
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender); 
    }
    
  /**
  @notice Once the metadata of the NFT has been uploaded on IPFS/Filecoin, this function is called to add the token by IPL Team Owner
  @dev Set supply, minted and rate arrays. Date coming from CricNFTTeamAgreement contract
  @param _id uint
  @param _imageCID bytes32
  @param _cid string
  **/
    function addToken(uint _id, string calldata _imageCID, string calldata _cid) public isAuthorized(_id){
      (, , , uint price, uint totalNumOfTokenstoMint, uint seasonId, ) = teamAgreement.getAgreementInfo(msg.sender, _id);
      require(tokenForSeason[msg.sender][seasonId]==false,"Token already added for this season");
        tokens.push(_id);
        supplies.push(totalNumOfTokenstoMint);
        minted.push(0);
        rates.push(price);
        //example: tokenURIs[1]="QmU7fyhpadQEouGUohCAiZ4e7NxfujFKbieHAPKESe6jt9";
        tokenURIs[_id]=_cid;
        iplTeamOwners[_id]=msg.sender;
        tokenForSeason[msg.sender][seasonId]=true;
        emit TokenAdded(_id, totalNumOfTokenstoMint, price, _imageCID ,_cid);
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
        require(SafeMath.add(balanceOf(msg.sender, id),amount) < 26, "You can only mint upto 25 NFTs for a given token");
        
        uint value = msg.value;
        uint contractShare = SafeMath.div(value,100);       // 1% contract share 
        balances[owner]+= contractShare;
        //console.log(contractShare);
        
        address _teamOwner = iplTeamOwners[id];
        balances[_teamOwner]+=SafeMath.sub(value,contractShare);
        //console.log(balances[_teamOwner]);

        _mint(msg.sender, id, amount, "");
        minted[index] += amount;
        emit Minted(msg.sender,id, amount);
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
            (bool success, ) = (msg.sender).call{value: amount}("");
            require(success, "Transfer failed.");
            emit Withdraw(msg.sender, _tokenId, amount);
    }

/**
  @notice Function to allow contract owner to withdraw contract share for each NFT purchased. 
  Housekeeping purpose only, this function will get totally replaced with claimShare() in future with updated logic
**/
/*
   function ownerWithdraw() public onlyRole(DEFAULT_ADMIN_ROLE){
            require(balances[msg.sender] > 0, "Insufficient Funds");
            uint amount = balances[msg.sender];
            balances[msg.sender]=0;
            (bool success, ) = (msg.sender).call{value: amount}("");
            require(success, "Transfer failed.");
    }
*/

/**
  @notice Function to allow winning team NFT holders to claim their share. 
  Winning Team result will come from API data stored in 'CricNFTGetAPIData' contract
  @dev Ensure the winner payout is tracked, substract total amount of minted tokens, substart contract share balance
  @param _seasonId uint
  @param _tokenId uint
**/
   
    function claimShare(uint _seasonId, uint _tokenId) external {
            require(getAPIData.getMatchWinner(_seasonId) > 0 , "Match winner not declared yet.");        //season id to winning token id
            require(getAPIData.getMatchWinner(_seasonId) == _tokenId , "Sorry, this token did not win.");        //season id to winning token id
            require(balanceOf(msg.sender, _tokenId) > 0, "You are not the owner of winnig team token.");
            require(winnerPayout[_tokenId][msg.sender]==false, "You have already claimed your share");
            require(balances[owner] > 0, "Not enough funds");

            uint amount = balances[owner];
           // console.log(amount);
           
            uint index = _tokenId-1;
            uint totalTokensMinted = minted[index];
            //console.log(totalTokensMinted);
            
            uint sharePerNFT = SafeMath.div(amount,totalTokensMinted);
            //console.log(sharePerNFT);

            winnerPayout[_tokenId][msg.sender]=true;
            
            uint numberOfNFTHolder = balanceOf(msg.sender, _tokenId);
            uint shareValue = sharePerNFT * numberOfNFTHolder;
            //console.log(shareValue);

            balances[owner]-=shareValue;
            minted[index] -=numberOfNFTHolder;
            (bool success, ) = (msg.sender).call{value: shareValue}("");
            require(success, "Transfer failed.");
            emit Claimed(msg.sender, _tokenId, shareValue);
            
    }
   


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
