import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Connect from "./Connect";
import {
  Web3Props,
  supportedNetworks,
  cryptoPunkAddress,
  wrappedPunkAddress,
} from "./App";
import { AbiItem } from "web3-utils";

import cryptoPunkABI from "../abi/CryptoPunksMarket.json";
import wrappedPunkABI from "../abi/WrappedPunk.json";

function Modal(props: { show: boolean; setShowModal: any }) {
  return (
    <dialog
      className="nes-dialog  with-title"
      id="dialog-default"
      open={props.show}
    >
      <form method="dialog">
        <p className="title">Info</p>
        <p>
          To create Punk Loot, you must first wrap your punk. Check out{" "}
          <Link to="/about">this guide</Link> to learn the process.
        </p>
        <menu className="dialog-menu">
          <button className="nes-btn" onClick={() => props.setShowModal(false)}>
            Cancel
          </button>
          <button className="nes-btn is-primary">Confirm</button>
        </menu>
      </form>
    </dialog>
  );
}

function Home(props: Web3Props) {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [cryptoPunkCount, setCryptoPunkCount] = useState<number | string>(
    "..."
  );
  const [wrappedPunkCount, setWrappedPunkCount] = useState<number | string>(
    "..."
  );

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
          const account = props.accounts[0];
          const punkBalance = await cryptoPunkContract.methods
            .balanceOf(account)
            .call();
          const wrappedBalance = await wrappedPunkContract.methods
            .balanceOf(account)
            .call();
          setCryptoPunkCount(punkBalance);
          setWrappedPunkCount(wrappedBalance);
        } catch (error) {
          setCryptoPunkCount("");
          setWrappedPunkCount("");
        }
      }
    })();
  }, [props.accounts]);

  const handleLootButton = (event: React.MouseEvent<HTMLElement>) => {
    setShowModal(!showModal);
  };

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
              <span className="nes-text is-primary">{wrappedPunkCount}</span>
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
          <Modal show={showModal} setShowModal={setShowModal} />
        </>
      )}
    </main>
  );
}

export default Home;
