import React, { useState  } from "react";
import { useMoralis } from "react-moralis";

import {abi} from './CricNFTMint.json';
import {abiAPI} from './CricNFTGetAPIData.json';

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
	const [values, setValues] = useState({ tokenId: "", apiData:"", message:""});     //To-do to assign apiData immediately
	const [imageURL, setImageURL] = React.useState("");
  const [teamName, setTeamName] = React.useState("");
  //const [apiData, setAPIData] = React.useState("");
  
  const handleSubmit = (event) => {
    event.preventDefault();
  }
	
  
  const uploadtoIPFS= async () => {
    let web3 = await Moralis.Web3.enableWeb3();
		let address = "0xA089B7AEb2fb4E9D5Fb193980e2940cfF59AADa6"    //contract 2
		const contract = new web3.eth.Contract(abiAPI, address.toLowerCase() );
		
    setValues({ ...values, apiData: await contract.methods.getResult(777).call()})
           
    const object = {
      "name" : {teamName},
      "description": "IPL Team Description goes here...",
      "image": `https://ipfs.io/ipfs/${imageURL}`,
      "properties": [{
        "jersey": `${values.apiData}`,
        "players": "Player Names goes here.."
      }
    ]      
    }
    const file = new Moralis.File("file.json", {base64 : btoa(JSON.stringify(object))});
    await file.saveIPFS();
    console.log(file.hash());
    console.log(file.ipfs());
    addToken(file.hash());
  };
 
  const addToken= async (val) => {
    let web3 = await Moralis.Web3.enableWeb3();
    let address = "0x501D0799131003e16089e881C5Bfe3073C2a8bC5"
    const contract = new web3.eth.Contract(abi, address.toLowerCase() );
  
    let receipt = await contract.methods
      .addToken(values.tokenId,web3.utils.asciiToHex(values.imageURL), web3.utils.asciiToHex(val))   //to-do
     // .addToken(values.tokenId,web3.utils.asciiToHex(val))
      .send({ from: user.attributes.ethAddress, value: 0 })
      .then((response) => {console.log(response)
        setValues({ ...values, message: "Congratulations! Token Added Successfully"})})
      .catch((err) => console.log(err));
    };    
		  

	return (
		<>
      
			<Flex sx={{ margin: 3 }}>				
			<Spacer />				
			</Flex>      
			<Flex sx={{ margin: 3 }} >				
				<Box p="5">
					<Heading size="md">Add ERC1155 Token to Allow Minting</Heading>
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
					<h4 size="md">IPL Team Name </h4></Box></Td>
          <Td><Box p="7">
          <Input
          width="250px"
        value={teamName}
        onChange={event => setTeamName(event.target.value)}    
      />
			</Box></Td>		   						
		</Tr>

    <Tr>		
    <Td><Box p="2">
					<h4 size="md">Image IPFS/Filecoin CID </h4></Box></Td>
          <Td><Box p="7">
          <Input
          width="600px"
        value={imageURL}
        onChange={event => setImageURL(event.target.value)}      
        
      />
			</Box></Td>		   						
		</Tr>            
    </Table>		
    
      <Button style={{backgroundColor: 'black', color:"white", fontFamily:"cursive", width:"300px",height: '30px'}}onClick={uploadtoIPFS}>Upload Metadata and Add Token</Button>				
      <Box p="2">
					<h4 size="md"> {values.message} </h4>
      </Box>
		</>
	);
}

export default CreateAgreement;