import { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Web3 from "web3";

import About from "./About";
import Home from "./Home";
import Header from "./Header";
import Footer from "./Footer";
import Loot from "./Loot";
import Wrap from "./Wrap";

import "../stylesheets/main.scss";

export interface Web3Props {
  accounts?: any;
  setAccounts?: any;
  connected?: boolean;
  network?: string;
  web3?: any;
}

const chainIdToNetwork: { [network: number]: string } = {
  1: "Mainnet",
  3: "Ropsten",
  4: "Rinkeby",
  5: "Goerli",
  42: "Kovan",
};

export const supportedNetworks: string[] = [
  // "Mainnet",
  "Rinkeby",
];

export const cryptoPunkAddress: { [network: string]: string } = {
  Mainnet: "0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB",
  Rinkeby: "0x999426cb37bb8Ea786d3E24F6094004fad686f70",
};
export const wrappedPunkAddress: { [network: string]: string } = {
  Mainnet: "0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6",
  Rinkeby: "0xb553B83d41D224Ef830aE9467E2F6DB612813081",
};
export const oracleAddress: { [network: string]: string } = {
  Rinkeby: "0x0eB0b9B6b9dc2572CD380f486fE1A7b353b97d16",
};
export const lootAddress: { [network: string]: string } = {
  Rinkeby: "0xa65fd1c92C9266bF0e5C838f206B083497acFEf2",
};

function App() {
  const web3 = new Web3(Web3.givenProvider);
  const [connected, setConnected] = useState<boolean>();
  const [accounts, setAccounts] = useState();
  const [network, setNetwork] = useState<string>();

  // Run whenever the accounts change
  useEffect(() => {
    if (accounts === undefined) {
      setConnected(false);
    } else {
      setConnected(true);
    }
  }, [accounts]);

  // Run only once on load
  useEffect(() => {
    const checkAccounts = async () => {
      if ((window as any).ethereum !== undefined) {
        if ((window as any).ethereum.selectedAddress !== null) {
          const accounts = await (window as any).ethereum.request({
            method: "eth_requestAccounts",
          });
          setAccounts(accounts);
        }
      }
    };
    checkAccounts();
    const interval = setInterval(checkAccounts, 1000);
    return () => clearInterval(interval);
  }, []);

  // Runs when network is changed
  useEffect(() => {
    (async () => {
      try {
        const id = await web3.eth.net.getId();
        setNetwork(chainIdToNetwork[id] || "Network");
      } catch (e) {}
    })();
  });

  return (
    <>
      <Router>
        <Header />
        <Switch>
          <Route path="/wrap">
            <Wrap
              accounts={accounts}
              connected={connected}
              network={network}
              web3={web3}
            />
          </Route>
          <Route path="/loot">
            <Loot
              accounts={accounts}
              connected={connected}
              network={network}
              web3={web3}
            />
          </Route>
          <Route path="/about">
            <About />
          </Route>
          <Route path="/">
            <Home
              accounts={accounts}
              setAccounts={setAccounts}
              connected={connected}
              network={network}
              web3={web3}
            />
          </Route>
        </Switch>
      </Router>
      <Footer
        accounts={accounts}
        setAccounts={setAccounts}
        connected={connected}
        network={network}
      />
    </>
  );
}

export default App;
