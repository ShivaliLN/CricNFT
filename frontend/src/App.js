import React, { useState, useEffect, useMemo,  Component } from "react";
import logo from './CricNFTApp.png';
import { useMoralis } from "react-moralis";

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
import Contact from "./Contact";



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
        <h1>Welcome {user.get("username")}</h1>
        <button style={{float: 'right'}} onClick={() => logout()}>Logout</button>
          <img src={logo} alt="Logo" width="125" height="130" />
          <h1>CricNFT Dapp</h1>
          <ul className="header">
          <li><NavLink exact to="/">Home</NavLink></li>
          <li><NavLink to="/createAgreement">Step 1 - Create Agreement</NavLink></li>
          <li><NavLink to="/addToken">Step 2 - Add Token</NavLink></li>
          <li><NavLink to="/marketplace">MarketPlace</NavLink></li>
          <li><NavLink to="/contact">Contact</NavLink></li>
          </ul>
          <div className="content">
          <Routes>
          <Route exact path="/" element={<Home />}/>
          <Route path="/createAgreement" element={<CreateAgreement/>}/>
          <Route path="/addToken" element={<AddToken/>}/>
          <Route path="/marketplace" element={<MarketPlace/>}/>
          <Route path="/contact" element={<Contact/>}/>
          </Routes>
          </div>
        </div>
        </Router>
    );
  }

 
export default App;