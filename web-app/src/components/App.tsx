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
  Rinkeby: "0xE87aC8d57874d886A0AD80C0371bc737d3cAB83d",
};
export const wrappedPunkAddress: { [network: string]: string } = {
  Mainnet: "0xb7F7F6C52F2e2fdb1963Eab30438024864c313F6",
  Rinkeby: "0x1B5821Ba755992AB097F4b20E8cd08314502a22f",
};
export const oracleAddress: { [network: string]: string } = {
  Rinkeby: "0x2f684ef818136Fd7D13Fb2d4268059C68E5610d4",
};
export const lootAddress: { [network: string]: string } = {
  Rinkeby: "0x3E9cBdA46984d63B0CA7c85Fc7E9e608c8e61A11",
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
