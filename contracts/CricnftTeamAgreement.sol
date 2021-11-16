// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/**
 * @title CricNFT Dapp
 * @author Shivali Sharma @ Chainlink Fall Hackathon 2021 
 **/

contract CricnftTeamAgreement is ChainlinkClient, AccessControl {
    using Chainlink for Chainlink.Request;
    
    enum AgreementStatus {invalid, setup, verified, live, ended}
    
    struct TeamAgreement {
        uint id;
        address publishedAddress;        
        uint teamId;
        uint dollarAmount;
        uint totalNumOfTokenstoMint;
        AgreementStatus status;
    }

    address public owner;
    address private oracle;
    bytes32 private jobId;
    uint256 private fee; 
    uint public result;
    uint public agreementId;

    address[] publishedTeamAddresses;
    uint[] teamIds;
    
    mapping (address=>bool) public teamAddresses;
    mapping (uint=>bool) public teamsInContract;
    mapping (address => mapping(uint => TeamAgreement)) teams;          //  
    mapping (address => mapping(uint => bytes32)) teamURI;     //  

    constructor() {
        setPublicChainlinkToken();
        oracle = 0x5cBace36c9Eb2016dE3E28b1b036F4E21D6e7e1c; 
        jobId = "9d6108af73744528a6fb1003a8eb2834"; 
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
        owner = msg.sender;
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(bytes32("TEAM_OWNER_ROLE"), msg.sender); 

    }

    /**
     * @notice Function to set published address of IPL team to allow them to create agreement
     * @param _teamAddress address
    */
    function setPublishedAddress(address _teamAddress) external onlyRole(DEFAULT_ADMIN_ROLE){             
             require(teamAddresses[_teamAddress]==false, "Address already exists");
             publishedTeamAddresses.push(_teamAddress);
             teamAddresses[_teamAddress]=true;
             grantRole(bytes32("TEAM_OWNER_ROLE"), _teamAddress);
             //emit AddressAdded();
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
  @param _dollarAmount uint
  @param _totalNumOfTokenstoMint uint
  **/

    function createTeamAgreement(uint _teamId, uint _dollarAmount, uint _totalNumOfTokenstoMint) 
        external        
        onlyRole(bytes32("TEAM_OWNER_ROLE"))  
    {
        require(teamAddresses[msg.sender]==true,"Not Authorized");
        require(teamsInContract[_teamId]==false,"Team already in agreement");
        require(_totalNumOfTokenstoMint > 0, "Agreement cannot be created with 0 tokens");
        require(_dollarAmount > 0, "Dollar Amount for team NFT cannot be zero");
        
        ++agreementId;
        TeamAgreement storage agreement = teams[msg.sender][_teamId];
        agreement.id = agreementId;
        agreement.publishedAddress = msg.sender;
        agreement.teamId = _teamId;
        agreement.dollarAmount = _dollarAmount;
        agreement.totalNumOfTokenstoMint = _totalNumOfTokenstoMint;
        agreement.status = AgreementStatus.setup;               
        teamIds.push(_teamId);
        teamsInContract[_teamId]=true;        
        //emit NewAgreementCreated();
    }

function removeAgreement(address _teamAddress, uint _teamId) external onlyRole(DEFAULT_ADMIN_ROLE){
        //emit AgreementDeleted();
        delete teams[_teamAddress][_teamId];        
}

function endAgreement(address _teamAddress, uint _teamId) external onlyRole(DEFAULT_ADMIN_ROLE){
        TeamAgreement storage agreement = teams[_teamAddress][_teamId]; 
        require(agreement.status== AgreementStatus.setup, "Only agreements in setup status can be ended");     
        agreement.status = AgreementStatus.ended;       
        //emit AgreementEnded();
}

function verfiyAgreement(address _teamAddress, uint _teamId) external onlyRole(DEFAULT_ADMIN_ROLE){
        TeamAgreement storage agreement = teams[_teamAddress][_teamId];   
        require(agreement.status== AgreementStatus.setup, "Only agreements in setup status can be verfiied");     
        agreement.status = AgreementStatus.verified;       
        //emit AgreementVerified();
}

function changeOwnership(address _newowner) external onlyRole(DEFAULT_ADMIN_ROLE){
    owner = _newowner;
    //emit NewOwner();
}

function getAgreementInfo(address _teamAddress, uint _teamId) public view returns(uint id, 
        address publishedAddress, 
        uint teamId, 
        uint dollarAmount,
        uint totalNumOfTokenstoMint,
        AgreementStatus status) {
         id = teams[_teamAddress][_teamId].id;
         publishedAddress = teams[_teamAddress][_teamId].publishedAddress;
         teamId = teams[_teamAddress][_teamId].teamId;
         dollarAmount = teams[_teamAddress][_teamId].dollarAmount;
         totalNumOfTokenstoMint = teams[_teamAddress][_teamId].totalNumOfTokenstoMint;
         status = teams[_teamAddress][_teamId].status;
}
    
    function requestIPLTeamData(uint8 _teamId) public returns (bytes32 requestId) 
    {
        /*
        // This will be a generic function to request IPL Info
        */
    }
    
    
    function fulfillIPLTeamData(bytes32 _requestId, uint _result) public recordChainlinkFulfillment(_requestId) {        
        /*
        // This will be a generic function to fulfill IPL Info       
        */
    }

    function setURI(string memory newuri) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // set mapping teamURI 
    }
    
}
