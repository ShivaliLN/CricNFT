import React, { useState } from "react";
import { useMoralis } from "react-moralis";

import {abi} from './CricNFTTeamAgreement.json';
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
	UnorderedList,
	ListItem,
  Grid,
  Table,
  Tr,
  Td,
} from "@chakra-ui/react";

function CreateAgreement() {
	const {
		Moralis,
		user,
		logout,
		authenticate,
		enableWeb3,
		isInitialized,
		isAuthenticated,
		isWeb3Enabled,
	} = useMoralis();
	const [values, setValues] = useState({ teamId: "", price: "", numNFT: "", seasonId:"", tokenId:"4" });		//To-do change to dynamically read
	
	
	const createAgreement= async () => {
			let web3 = await Moralis.Web3.enableWeb3();
			let address = "0x31810884311A857c827f8f354c3724f5397FF6b3"
			const contract = new web3.eth.Contract(abi, address.toLowerCase() );
		
			let receipt = await contract.methods
			  .createTeamAgreement(values.teamId,web3.utils.toWei(values.price), values.numNFT, values.seasonId)
			  .send({ from: user.attributes.ethAddress, value: 0 })
			  .then((response) => {console.log(response)
				setValues({ ...values, tokenId: parseInt(response.events[0].raw.topics[1])})})
			  .catch((err) => console.log(err));
		  };
	
	return (
		<>
			<Flex sx={{ margin: 3 }}>				
			<Spacer />				
			</Flex>
			
			<Flex sx={{ margin: 3 }} >				
				<Box p="2">
					<Heading size="md">Create Agreement</Heading>
				</Box>
			<Spacer />
			</Flex>	           
      			
    <Table variant="simple">
	<Tr>		
    <Td><Box p="2">
					<h4 size="md">IPL Team ID</h4></Box></Td>
					
          <Td><Box p="7">
				<NumberInput
						min={0}
						value={values.teamId}
						onChange={(valueString) =>
							setValues({ ...values, teamId: valueString })
						}
					>
						<NumberInputField sx={{ borderColor: "1px solid black" }} />
				</NumberInput>
			</Box></Td>		   						
		</Tr>    

    <Tr>		
    <Td><Box p="2">
					<h4 size="md">Total Number of NFT </h4></Box></Td>
          <Td><Box p="7">
				<NumberInput
						min={0}
						value={values.numNFT}
						onChange={(valueString) =>
							setValues({ ...values, numNFT: valueString })
						}
					>
						<NumberInputField sx={{ borderColor: "1px solid black" }} />
				</NumberInput>
			</Box></Td>		   						
		</Tr>  

    <Tr>		
    <Td><Box p="2">
					<h4 size="md">Price Per NFT (ETH/MATIC) </h4></Box></Td>
          <Td><Box p="7">
				<NumberInput						
						value={values.price}
						onChange={(valueString) =>
							setValues({ ...values, price: valueString })
						}
					>
						<NumberInputField sx={{ borderColor: "1px solid black" }} />
				</NumberInput>
			</Box></Td>		   						
		</Tr>  

    <Tr>		
    <Td><Box p="2">
					<h4 size="md">IPL Season ID </h4></Box></Td>
          <Td><Box p="7">
				<NumberInput
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
      <Button style={{backgroundColor: 'black', color:"white", fontFamily:"cursive", width:"200px",height: '30px'}}onClick={createAgreement}>Create Agreement</Button>
	  <Box p="15">
					<Heading size="md">Your Token Id: {values.tokenId}</Heading>
	</Box>				
		</>
	);
}

export default CreateAgreement;