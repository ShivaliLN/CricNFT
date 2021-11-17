//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";
import "contracts/CricnftTeamAgreement.sol";

contract CricNFTGenerate is KeeperCompatibleInterface, ChainlinkClient {
    using Chainlink for Chainlink.Request;
    CricnftTeamAgreement teamAgreement;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    uint256 public resultValue;
    string public resultString;
    uint public upKeepcounter;

    mapping(bytes32 => uint) public requestIdTeam;
    mapping(uint => uint) public teamidResult;
    
    constructor(address _teamAddress) {
        teamAgreement = CricnftTeamAgreement(_teamAddress); 
        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8; 
        jobId = "d5270d1c311941d0b08bead21fea7747"; 
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
    }
    
    /**
     * Initial request
     */
     //function requestData() public returns (bytes32 requestId) 
    function requestData(uint _teamId) public returns (bytes32 requestId)     
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request on
        request.add("get", "https://api.sportsdata.io/v3/soccer/scores/json/Player/90026231?key=32474a4d5c0a4340b55ebc1fcea3ead6");
        //req.add("teamId", "_teamId");
        request.add("path", "Jersey");

        return sendChainlinkRequestTo(oracle, request, fee);
                       
        // Sends the request
        //return sendChainlinkRequestTo(oracle, request, fee);
        //requestId = "32874239";
        //result = 19;
    }
    
    /**
     * Callback function
     */
    function fulfill(bytes32 _requestId, uint256 _result) public recordChainlinkFulfillment(_requestId) {
        resultValue = _result;
        teamidResult[requestIdTeam[_requestId]]=resultValue;
    }

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

  function checkUpkeep(bytes calldata checkData) external view override returns (bool upkeepNeeded, bytes memory performData) {
        bool foundToken;
        uint agreementCount = teamAgreement.agreementId();        
        if(agreementCount > upKeepcounter ){                  
                    foundToken=true;
        }
        
        upkeepNeeded=foundToken;
        performData=checkData;        
    }

function performUpkeep(bytes calldata) external override {
            uint agreementCount = teamAgreement.agreementId();
            uint teamId = teamAgreement.getTeamIdInfo(agreementCount);            
            bytes32 reqId = requestData(teamId);
            requestIdTeam[reqId]=teamId;
            upKeepcounter++;
    } 

    
}
