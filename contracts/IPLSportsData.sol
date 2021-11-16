//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract IPLSportsData is ChainlinkClient {
    using Chainlink for Chainlink.Request;

    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    bytes32 public result;
    string public resultString;
    
    constructor() {
        setPublicChainlinkToken();
        oracle = 0xfF07C97631Ff3bAb5e5e5660Cdf47AdEd8D4d4Fd; //0xAA1DC356dc4B18f30C347798FD5379F3D77ABC5b; //0xfF07C97631Ff3bAb5e5e5660Cdf47AdEd8D4d4Fd;
        jobId = "491c282eb8b7451699855992d686a20b"; //"b7285d4859da4b289c7861db971baf0a";  //"9abb342e5a1d41c6b72941a3064cf55f";      
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
    }
    
    /**
     * Initial request
     */
    function requestData() public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        // Set the URL to perform the GET request on
        //request.add("get", "https://api.sportsdata.io/v3/soccer/scores/json/Areas?key=32474a4d5c0a4340b55ebc1fcea3ead6");
        //request.add("get", "https://api.sportsdata.io/v3/soccer/scores/json/Player/90026231?key=32474a4d5c0a4340b55ebc1fcea3ead6");
        //request.add("get", "https://api.sportsdata.io/v3/soccer/stats/json/PlayerSeasonStatsByPlayer/1/90026231?key=??");
        
        //request.add("path", "FirstName");
        //request.add("path", "data.0.Games");
        //request.add("get", "http://rainfall-oracle.com/");
        //request.add("get", "https://api.sportsdata.io/v3/soccer/scores/json/Player/90026231?key=32474a4d5c0a4340b55ebc1fcea3ead6");
        request.add("endpoint", "toss-results");

        request.add("round", "4th Match");

        request.add("season_id", "708");

        return sendChainlinkRequestTo(oracle, request, fee);
                       
        // Sends the request
        //return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    /**
     * Callback function
     */
    function fulfill(bytes32 _requestId, bytes32 _result) public recordChainlinkFulfillment(_requestId) {
        result = _result;
        resultString = bytes32ToString(_result);
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

    
}
