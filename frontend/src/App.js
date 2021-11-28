import React, { useState, useEffect, useMemo,  Component } from "react";
import logo from './CricNFTApp.png';
import { useMoralis } from "react-moralis";
import { Moralis } from 'moralis';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  HashRouter
} from "react-router-dom";
import Home from "./Home";
import CreateAgreement from "./CreateAgreement";
import AddToken from "./AddToken";
import MarketPlace from "./MarketPlace";
import ClaimShare from "./ClaimShare";
/* Moralis init code */
const appId = process.env.REACT_APP_MORALIS_APP_ID;
const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
Moralis.start({ serverUrl, appId });

  function App() {
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
    const web3Account = useMemo(
      () => isAuthenticated && user.get("accounts")[0],
      [user, isAuthenticated],
    );
    if (!isAuthenticated) {
      return (
        <div>
          <button onClick={() => authenticate({ signingMessage: "CricNFT Terms & Conditions!" })}>Authenticate</button>
        </div>
      );
    }

    

    return (
      <Router>
        <div>
                
        <button style={{float: 'right'}} onClick={() => logout()}>Logout</button>
        <div style={{float: 'right'}}>{web3Account}</div>
          <img src={logo} alt="Logo" width="125" height="130" />
          <h1>CricNFT Dapp</h1>
          <ul className="header">
          <li><NavLink exact to="/">Home</NavLink></li>
          <li><NavLink to="/createAgreement">Step 1 - Create Agreement</NavLink></li>
          <li><NavLink to="/addToken">Step 2 - Upload Metadata and Add Token</NavLink></li>
          <li><NavLink to="/marketplace">MarketPlace</NavLink></li>
          <li><NavLink to="/claim">Withdraw or Claim Share</NavLink></li>
          </ul>
          <div className="content">
          <Routes>
          <Route exact path="/" element={<Home />}/>
          <Route path="/createAgreement" element={<CreateAgreement/>}/>
          <Route path="/addToken" element={<AddToken/>}/>
          <Route path="/marketplace" element={<MarketPlace/>}/>
          <Route path="/claim" element={<ClaimShare/>}/>
          </Routes>
          </div>
        </div>
        </Router>
    );
  }

 
export default App;