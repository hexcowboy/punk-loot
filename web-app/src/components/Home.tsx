import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Connect from "./Connect";
import {
  Web3Props,
  supportedNetworks,
  cryptoPunkAddress,
  lootAddress,
  wrappedPunkAddress,
} from "./App";
import { AbiItem } from "web3-utils";

import cryptoPunkABI from "../abi/CryptoPunksMarket.json";
import wrappedPunkABI from "../abi/WrappedPunk.json";
import lootABI from "../abi/Loot.json";

function Home(props: Web3Props) {
  const [cryptoPunkCount, setCryptoPunkCount] = useState<number | string>(
    "..."
  );
  const [wrappedPunkCount, setWrappedPunkCount] = useState<number | string>(
    "..."
  );
  const [lootCount, setLootCount] = useState<number | string>("...");

  useEffect(() => {
    (async () => {
      if (props.connected && supportedNetworks.includes(props.network!)) {
        try {
          const cryptoPunkContract = new props.web3.eth.Contract(
            cryptoPunkABI as AbiItem[],
            cryptoPunkAddress[props.network!]
          );
          const wrappedPunkContract = new props.web3.eth.Contract(
            wrappedPunkABI as AbiItem[],
            wrappedPunkAddress[props.network!]
          );
          const lootContract = new props.web3.eth.Contract(
            lootABI as AbiItem[],
            lootAddress[props.network!]
          );
          const account = props.accounts[0];
          const punkBalance = await cryptoPunkContract.methods
            .balanceOf(account)
            .call();
          const wrappedBalance = await wrappedPunkContract.methods
            .balanceOf(account)
            .call();
          const lootBalance = await lootContract.methods
            .balanceOf(account)
            .call();
          setCryptoPunkCount(punkBalance);
          setWrappedPunkCount(wrappedBalance);
          setLootCount(lootBalance);
        } catch (error) {
          console.log(error);
          setCryptoPunkCount("");
          setWrappedPunkCount("");
          setLootCount("");
        }
      }
    })();
  }, [props.accounts]);

  return (
    <main className="home">
      {!props.connected && (
        <Connect accounts={props.accounts} setAccounts={props.setAccounts} />
      )}
      {props.connected && (
        <>
          <div className="nes-container with-title is-centered">
            <p className="title">Balances</p>
            <p>
              Original Punks:{" "}
              <span className="nes-text is-primary">{cryptoPunkCount}</span>
            </p>
            <p>
              Wrapped Punks:{" "}
              <span className="nes-text is-primary">{wrappedPunkCount}</span>
            </p>
            <p>
              Punk Loot:{" "}
              <span className="nes-text is-primary">{lootCount}</span>
            </p>
            <menu>
              <Link className="nes-btn is-primary" to="/wrap">
                Wrap
              </Link>
              <Link className="nes-btn is-primary" to="/loot">
                Loot
              </Link>
            </menu>
          </div>
          <br />
        </>
      )}
    </main>
  );
}

export default Home;
