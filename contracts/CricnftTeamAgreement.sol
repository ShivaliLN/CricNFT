// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CricNFT Dapp (STEP 1 CONTRACT)
 * @author Shivali Sharma @ Chainlink Fall Hackathon 2021 
 **/

contract CricNFTTeamAgreement is AccessControl {
        
    enum AgreementStatus {invalid, setup, ended} // default 0=invalid
    
    struct TeamAgreement {
        uint tokenId;
        address publishedAddress;        
        uint teamId;
        uint price;
        uint totalNumOfTokenstoMint;
        uint seasonId;        
        AgreementStatus status;
    }

    address public owner;  
    uint public agreementId;
    uint public counter;

    address[] public publishedTeamAddresses;
    uint[] teamIds;
    
    mapping (address=>bool) public teamAddresses;
    mapping (uint=> mapping(uint => bool)) public teamsInContract; //TeamId => seasonId => bool
    mapping (address => mapping(uint => TeamAgreement)) teams;          //  IPL Team Owner => tokenId => TeamAgreement struct
    mapping (uint => TeamAgreement) upKeepUse;          //  tokenId => TeamAgreement struct
    mapping (address => mapping(uint => bool)) teamSeasonAdded;          //  IPL Team Owner => season => bool
    
    event AddressAdded(address indexed);
    event NewAgreementCreated(address indexed teamAddress,uint indexed tokenId, uint teamId, uint price, uint totalNumOfTokenstoMint);
    event AgreementEnded(address indexed teamAddress, uint seasonId);
    event NewOwner(address indexed _newowner);

    constructor() {
        owner = msg.sender;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(bytes32("TEAM_OWNER_ROLE"), msg.sender); 

    }

    /**
     * @notice Function to set published address of IPL team to allow them to create agreement
     * @dev For now this function is called by owner of the contract (plan to have Chainlink oracle endpoint setup to get the information). 
     * @param _teamAddress address
    */
    function setPublishedAddress(address _teamAddress) external onlyRole(DEFAULT_ADMIN_ROLE){             
             require(teamAddresses[_teamAddress]==false, "Address already exists");
             publishedTeamAddresses.push(_teamAddress);
             teamAddresses[_teamAddress]=true;
             grantRole(bytes32("TEAM_OWNER_ROLE"), _teamAddress);
             emit AddressAdded(_teamAddress);
    }

    /**
     * @notice Function to get info if the IPL team address is added to the list
     * @dev Return bool true or false
     * @param _teamAddress address
    */
    function getTeamAddressInfo(address _teamAddress) public view returns(bool) {
    return teamAddresses[_teamAddress];
    } 

  /**
  @notice This function is called by IPL team owner to get in agreement for creating NFT for the team 
  @dev Create TeamAgreement
  @param _teamId uint
  @param _price uint
  @param _totalNumOfTokenstoMint uint
  @param _seasonId uint  
  **/

    function createTeamAgreement(uint _teamId, uint _price, uint _totalNumOfTokenstoMint, uint _seasonId) 
        external        
        onlyRole(bytes32("TEAM_OWNER_ROLE"))  
    {
        require(teamAddresses[msg.sender]==true,"Not Authorized");
        require(teamsInContract[_teamId][_seasonId]==false,"Team already in agreement for this season");
        require(teamSeasonAdded[msg.sender][_seasonId]==false,"Not Authorized to create agreement for multiple teams");
        require(_totalNumOfTokenstoMint > 0, "Agreement cannot be created with 0 tokens");
        require(_price > 0, "Price for team NFT cannot be zero");
        
        ++agreementId;
        TeamAgreement storage agreement = teams[msg.sender][agreementId];
        agreement.tokenId = agreementId;
        agreement.publishedAddress = msg.sender;
        agreement.teamId = _teamId;
        agreement.price = _price;
        agreement.totalNumOfTokenstoMint = _totalNumOfTokenstoMint;
        agreement.status = AgreementStatus.setup;
        agreement.seasonId = _seasonId;                       
        teamIds.push(_teamId);
        teamsInContract[_teamId][_seasonId]=true;
        upKeepUse[agreementId] = agreement;        
        teamSeasonAdded[msg.sender][_seasonId]=true;
        emit NewAgreementCreated(msg.sender,agreementId, _teamId, _price, _totalNumOfTokenstoMint);
    }

 /**
  @notice This function to read the agreement information for given teamaddress and seasonId 
  @param _teamAddress address
  @param _tokenId uint
  **/

function getAgreementInfo(address _teamAddress, uint _tokenId) public view returns(uint id, 
        address publishedAddress, 
        uint teamId, 
        uint price,
        uint totalNumOfTokenstoMint,
        uint seasonId,        
        AgreementStatus status) {
         id = teams[_teamAddress][_tokenId].tokenId;
         publishedAddress = teams[_teamAddress][_tokenId].publishedAddress;
         teamId = teams[_teamAddress][_tokenId].teamId;
         price = teams[_teamAddress][_tokenId].price;
         totalNumOfTokenstoMint = teams[_teamAddress][_tokenId].totalNumOfTokenstoMint;
         seasonId = teams[_teamAddress][_tokenId].seasonId;        
         status = teams[_teamAddress][_tokenId].status;
}

/**
  @notice This function used by chainlink keepers to get the teamId to query data from API 
  @param _tokenId uint
**/
function getTeamIdInfo(uint _tokenId) public view returns(uint teamId) {
         return teamId = upKeepUse[_tokenId].teamId;         
}


// Housekeeping purpose may not be needed
function endAgreement(address _teamAddress, uint _tokenId) external onlyRole(DEFAULT_ADMIN_ROLE){
        TeamAgreement storage agreement = teams[_teamAddress][_tokenId]; 
        require(agreement.status== AgreementStatus.setup, "Only agreements in setup status can be ended");     
        agreement.status = AgreementStatus.ended;       
        emit AgreementEnded(_teamAddress,_tokenId);
}

function changeOwnership(address _newowner) external onlyRole(DEFAULT_ADMIN_ROLE){
    owner = _newowner;
    emit NewOwner(_newowner);
}


/**
  @notice This function is used by CricNFTMint to authorize user to add token for NFT minting 
  @param _user address
  @param _tokenId uint
**/
function isAuthorizedOwner(address _user, uint _tokenId) public view returns(bool) {
    return upKeepUse[_tokenId].publishedAddress==_user;
}



}
