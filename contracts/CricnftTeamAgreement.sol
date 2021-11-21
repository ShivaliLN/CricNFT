// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title CricNFT Dapp (STEP 1 CONTRACT)
 * @author Shivali Sharma @ Chainlink Fall Hackathon 2021 
 **/

contract CricNFTTeamAgreement is AccessControl {
        
    enum AgreementStatus {invalid, setup, live, ended} // default 0=invalid
    
    struct TeamAgreement {
        uint tokenId;
        address publishedAddress;        
        uint teamId;
        uint price;
        uint totalNumOfTokenstoMint;
        uint seasonId;
        string imageCID;
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
    
    event AddressAdded(address);
    event NewAgreementCreated(address indexed teamAddress,uint seasonId);
    event AgreementEnded(address indexed teamAddress, uint seasonId);
    event NewOwner(address _newowner);

    constructor() {
        owner = msg.sender;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(bytes32("TEAM_OWNER_ROLE"), msg.sender); 

    }

    /**
     * @notice Function to set published address of IPL team to allow them to create agreement
     * @dev For now this function is called by owner of the contract but later should be verfied during create agreement that the address is a valid IPL team address by ENS validation
     * against oracle API data 
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
  @param _imageCID string
  **/

    function createTeamAgreement(uint _teamId, uint _price, uint _totalNumOfTokenstoMint, uint _seasonId, string calldata _imageCID) 
        external        
        onlyRole(bytes32("TEAM_OWNER_ROLE"))  
    {
        require(teamAddresses[msg.sender]==true,"Not Authorized");
        require(teamsInContract[_teamId][_seasonId]==false,"Team already in agreement for this season");
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
        agreement.imageCID = _imageCID;               
        teamIds.push(_teamId);
        teamsInContract[_teamId][_seasonId]=true;
        upKeepUse[agreementId] = agreement;        
        emit NewAgreementCreated(msg.sender,_seasonId);
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
        string memory imageCID,
        AgreementStatus status) {
         id = teams[_teamAddress][_tokenId].tokenId;
         publishedAddress = teams[_teamAddress][_tokenId].publishedAddress;
         teamId = teams[_teamAddress][_tokenId].teamId;
         price = teams[_teamAddress][_tokenId].price;
         totalNumOfTokenstoMint = teams[_teamAddress][_tokenId].totalNumOfTokenstoMint;
         seasonId = teams[_teamAddress][_tokenId].seasonId;
         imageCID = teams[_teamAddress][_tokenId].imageCID;
         status = teams[_teamAddress][_tokenId].status;
}

/**
  @notice This function used by chainlink keepers to get the teamId to query data from API 
  @param _tokenId uint
**/
function getTeamIdInfo(uint _tokenId) public view returns(uint teamId) {
         return teamId = upKeepUse[_tokenId].teamId;         
}

/*
// Housekeeping purpose might not be needed
function removeAgreement(address _teamAddress, uint _tokenId) external onlyRole(DEFAULT_ADMIN_ROLE){
        //emit AgreementDeleted();
        delete teams[_teamAddress][_tokenId];        
}
*/

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
  @notice This function used by CricNFTMint to authorize user to add token for NFT minting 
  @param _user address
  @param _tokenId uint
**/
function isAuthorizedOwner(address _user, uint _tokenId) public view returns(bool) {
    return upKeepUse[_tokenId].publishedAddress==_user;
}



}
