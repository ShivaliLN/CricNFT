//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "contracts/CricNFTTeamAgreement.sol";

/**
 * @title CricNFTGetAPIData (STEP 2 CONTRACT)
 * @notice Using Chainlink Keepers - As and when a new agreement is created this contract will get the API data for the IPL team id which will be used as NFT "properties"
 * As a Proof of concept (PoC) this is bringing soccer data right now as I am working on getting the oracle setup for cricket data
 * Only available oracle by SportsMonk provides Toss-Results & Match-Results for IPL
 * @author Shivali Sharma @ Chainlink Fall Hackathon 2021 
 **/

contract CricNFTGetAPIData is KeeperCompatibleInterface, ChainlinkClient {
    using Chainlink for Chainlink.Request;
    CricNFTTeamAgreement teamAgreement;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;

    address private oracle2;
    bytes32 private jobId2;
    uint256 private fee2;
    
    bytes32 public matchResult;
    uint256 public resultValue;
    string public resultString;
    uint public upKeepcounter;

    mapping(bytes32 => uint) public requestIdTeam;
    mapping(uint => uint) public teamidResult;
    mapping(uint => uint) matchResults;  //season id to winning token id
    
    constructor(address _teamAddress) {
        teamAgreement = CricNFTTeamAgreement(_teamAddress); 
        setPublicChainlinkToken();
        //Oracle on Kovan that performs tasks(HTTPGet, ethuint, jsonparse, ethtx..)
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8; 
        jobId = "d5270d1c311941d0b08bead21fea7747"; 
        fee = 0.1 * 10 ** 18; // (Varies by network and job)

        //Oracle on POLYGON that performs tasks(HTTPGet, ethuint, jsonparse, ethtx..)
        //oracle = 0x0bDDCD124709aCBf9BB3F824EbC61C87019888bb; 
        //jobId = "2bb15c3f9cfc4336b95012872ff05092"; 
        //fee = 0.1 * 10 ** 18; // (Varies by network and job)

        //SportsMonk Kovan Oracle for IPL Toss-Results & Match-Results data for 2021 season
        oracle2 = 0xfF07C97631Ff3bAb5e5e5660Cdf47AdEd8D4d4Fd; 
        jobId2 = "491c282eb8b7451699855992d686a20b"; 
        fee2 = 0.1 * 10 ** 18; // 

        //SportsMonk POLYGON Oracle for IPL Toss-Results & Match-Results data for 2021 season
        //oracle2 = TBD; 
        //jobId2 = TBD; 
        //fee2 = TBD; // 
    }
    
/**
     * @notice checkUpKeep will monitor if any new agreement has been created by 'CricNFTTeamAgreement.sol'
     * @dev Register/Setup keepers on both Kovan and Polygon 
*/
function checkUpkeep(bytes calldata checkData) external view override returns (bool upkeepNeeded, bytes memory performData) {
        bool foundToken;
        uint agreementCount = teamAgreement.agreementId();        
        if(agreementCount > upKeepcounter ){                  
                    foundToken=true;
        }
        
        upkeepNeeded=foundToken;
        performData=checkData;        
    }

/**
     * @notice performUpkeep will trigger 'requestData' from API that will be stored for each teamId
*/
function performUpkeep(bytes calldata) external override {
            uint agreementCount = teamAgreement.agreementId();
            uint teamId = teamAgreement.getTeamIdInfo(agreementCount);            
            bytes32 reqId = requestData(teamId);
            requestIdTeam[reqId]=teamId;
            upKeepcounter++;
    } 

/**
     * Initial request
     * @notice - THIS URL IS CURRENTLY BRINGING SOCCER DATA TO DO POC AS CRICKET ORACLE IS NOT AVAILABLE IN MARKETPLACE
     * WORKING ON CREATING A CUSTOMIZED CRICKET ORACLE THAT CAN BRING TEAM DATA
*/
    function requestData(uint _teamId) public returns (bytes32 requestId)     
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request on        
        request.add("get", "https://api.sportsdata.io/v3/soccer/scores/json/Player/90026231?key=32474a4d5c0a4340b55ebc1fcea3ead6");
        request.add("path", "Jersey");      
        //req.add("teamId", "_teamId");  // for cricekt

        return sendChainlinkRequestTo(oracle, request, fee);                      
        
    }
    
    /**
     * Callback function
     */
    function fulfill(bytes32 _requestId, uint256 _result) public recordChainlinkFulfillment(_requestId) {
        resultValue = _result;
        teamidResult[requestIdTeam[_requestId]]=resultValue;
    }

    /**
     * Initial request
     * @notice - SportsMonk Oracle provides Toss-Results & Match-Results for IPL
     * @dev - Pointing to oracle2, jobId2 declared above
     */     
    function requestIPLData() public returns (bytes32 requestId)     
    {
        Chainlink.Request memory request2 = buildChainlinkRequest(jobId2, address(this), this.fulfillIPL.selector);
        
        // Set the URL to perform the GET request on
        request2.add("endpoint", "toss-results");
        //request2.add("endpoint", "match-results");        
        request2.add("round", "4th Match");
        request2.add("season_id", "708");       //season id 708 for IPL 2021

        return sendChainlinkRequestTo(oracle2, request2, fee2);
    }

    /**
     * Callback function
     */
    function fulfillIPL(bytes32 _requestId, bytes32 _result) public recordChainlinkFulfillment(_requestId) {
        matchResult = _result;
        resultString = bytes32ToString(_result);
    }

    /**
     * Initial request
     * @dev - Functions to convert bytes to string or string to bytes
     */ 

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        uint8 i = 0;
        while(i < 32 && _bytes32[i] != 0) {
            i++;
        }
        bytes memory bytesArray = new bytes(i);
        for (i = 0; i < 32 && _bytes32[i] != 0; i++) {
            bytesArray[i] = _bytes32[i];
        }
        return string(bytesArray);
    }
    
    function stringToBytes32(string memory source) public pure returns (bytes32 _result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly { // solhint-disable-line no-inline-assembly
            _result := mload(add(source, 32))
        }
  }
    
}
