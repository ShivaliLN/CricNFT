import React, { useState  } from "react";
import { useMoralis } from "react-moralis";

import {abi} from './CricNFTMint.json';
import {abiAPI} from './CricNFTGetAPIData.json'

import {
	Flex,
	Box,
	Spacer,
	Heading,
	Button,
	Stack,
	Input,
	NumberInput,
	NumberInputField,
	Image, 
	Text,
	ListItem,
  Grid,
  Table,
  Tr,
  Td,
} from "@chakra-ui/react";

function ClaimShare() {
	const {
		Moralis,
		user,
	} = useMoralis();
	const [values, setValues] = useState({ seasonId: "708", tokenId: "", winner: ""});
	  
  const handleSubmit = (event) => {
    event.preventDefault();
  }   
  
  const getWinner= async () => {
    let web3 = await Moralis.Web3.enableWeb3();
    let address = "0xA089B7AEb2fb4E9D5Fb193980e2940cfF59AADa6" //contract 2 address
    const contract = new web3.eth.Contract(abiAPI, address.toLowerCase() );
  
    let receipt = await contract.methods.getMatchWinner(values.seasonId).call()
		.then((response) => {console.log(response)
			setValues({ ...values, winner: response })})
	  	.catch((err) => console.log(err));
    };	
    
    

  const claimShare= async () => {
    getWinner();
    let web3 = await Moralis.Web3.enableWeb3();
    let address = "0x501D0799131003e16089e881C5Bfe3073C2a8bC5" //contract 3 address
    const contract = new web3.eth.Contract(abi, address.toLowerCase() );
  
    let receipt = await contract.methods
      .claimShare(values.seasonId,values.tokenId)
      .send({ from: user.attributes.ethAddress, value: 0 })
      .then((response) => console.log(response))
	  .catch((err) => console.log(err));
    };
	
	const withdraw= async () => {
		let web3 = await Moralis.Web3.enableWeb3();
		let address = "0x501D0799131003e16089e881C5Bfe3073C2a8bC5" //contract 3 address
		const contract = new web3.eth.Contract(abi, address.toLowerCase() );
	  
		let receipt = await contract.methods
		  .withdraw(values.tokenId)
		  .send({ from: user.attributes.ethAddress, value: 0 })
		  .then((response) => console.log(response))
		  .catch((err) => console.log(err));
		};

	return (
		<>
      
		<Flex sx={{ margin: 3 }}>				
			<Spacer />				
			</Flex>      
			<Flex sx={{ margin: 3 }} >				
				<Box p="5">
					<Heading size="md">Withdraw or Claim Share</Heading>
				</Box>
			<Spacer />
			</Flex>	  

      <Flex sx={{ margin: 3 }} >				
				<Box p="5">
					<h3 size="md">Winning Token Id: {values.winner}</h3>
				</Box>
			<Spacer />
			</Flex>	         
      			
    <Table variant="simple">
    
    <Tr>		
    <Td><Box p="2">
					<h4 size="md">Token ID </h4></Box></Td>
          <Td><Box p="7">
				<NumberInput
            width="100px"
						min={0}
						value={values.tokenId}
						onChange={(valueString) =>
							setValues({ ...values, tokenId: valueString })
						}
					>
						<NumberInputField sx={{ borderColor: "1px solid black" }} />
				</NumberInput>
			</Box></Td>		   						
		</Tr>    

    <Tr>		
    <Td><Box p="2">
					<h4 size="md">Season ID </h4></Box></Td>
          <Td><Box p="7">
				<NumberInput
            width="100px"
						min={0}
						value={values.seasonId}
						onChange={(valueString) =>
							setValues({ ...values, seasonId: valueString })
						}
					>
						<NumberInputField sx={{ borderColor: "1px solid black" }} />
				</NumberInput>
			</Box></Td>		   						
		</Tr>           
    </Table>		
    
      <Button style={{backgroundColor: 'black', color:"white", fontFamily:"cursive", width:"300px",height: '30px'}}onClick={claimShare}>Claim Share</Button>

	<h3 size="md">For IPL Team Owners: {values.winner}</h3>					
	  <Button style={{backgroundColor: 'black', color:"white", fontFamily:"cursive", width:"300px",height: '30px'}}onClick={withdraw}>Withdraw</Button>				
		</>
	);
}
 
export default ClaimShare;