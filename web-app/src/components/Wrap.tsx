import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Web3Props,
  supportedNetworks,
  cryptoPunkAddress,
  wrappedPunkAddress,
} from "./App";
import { AbiItem } from "web3-utils";

import cryptoPunkABI from "../abi/CryptoPunksMarket.json";
import wrappedPunkABI from "../abi/WrappedPunk.json";

function Wrap(props: Web3Props) {
  const [id, setId] = useState<string>("");
  const [ownsPunk, setOwnsPunk] = useState<boolean>(false);
  const [proxyRegistered, setProxyRegistered] = useState<boolean>(false);
  const [punkInProxy, setPunkInProxy] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if (props.connected && supportedNetworks.includes(props.network!)) {
        try {
          // Check if account has registered a proxy
          const account = props.accounts[0];
          const wrappedPunkContract = new props.web3.eth.Contract(
            wrappedPunkABI as AbiItem[],
            wrappedPunkAddress[props.network!]
          );

          const proxyInfo = await wrappedPunkContract.methods
            .proxyInfo(account)
            .call();
          const registered =
            proxyInfo !== "0x0000000000000000000000000000000000000000";
          setProxyRegistered(registered);

          if (id) {
            const punkOwner = await wrappedPunkContract.methods
              .ownerOf(id)
              .call()
              .catch(() => true);
            const ownerIsProxy = punkOwner === proxyInfo;
            setPunkInProxy(ownerIsProxy);
          }
        } catch (error: any) {
          setError(error.message);
        }
      }
    })();
  }, [props.accounts]);

  useEffect(() => {
    (async () => {
      if (props.connected && supportedNetworks.includes(props.network!)) {
        try {
          const account = props.accounts[0];
          const cryptoPunkContract = new props.web3.eth.Contract(
            cryptoPunkABI as AbiItem[],
            cryptoPunkAddress[props.network!]
          );

          if (id) {
            const owner = await cryptoPunkContract.methods
              .punkIndexToAddress(id)
              .call();
            setOwnsPunk(owner.toLowerCase() === account.toLowerCase());
          } else {
            setOwnsPunk(false);
          }
        } catch (error) {
          console.log(error);
          setOwnsPunk(false);
        }
      }
    })();
  }, [id]);

  async function handleWrap(event: React.MouseEvent<HTMLElement>) {
    if (ownsPunk) {
      if (props.connected && supportedNetworks.includes(props.network!)) {
        try {
          const account = props.accounts[0];
          const wrappedPunkContract = new props.web3.eth.Contract(
            wrappedPunkABI as AbiItem[],
            wrappedPunkAddress[props.network!]
          );
          if (!proxyRegistered) {
            wrappedPunkContract.methods
              .registerProxy()
              .send({ from: account })
              .catch((error: any) => setError(error.message));
          } else {
            const cryptoPunkContract = new props.web3.eth.Contract(
              cryptoPunkABI as AbiItem[],
              cryptoPunkAddress[props.network!]
            );
            const proxyAddress = await wrappedPunkContract.methods
              .proxyInfo(account)
              .call();
            await cryptoPunkContract.methods
              .transferPunk(proxyAddress, id)
              .send({ from: account })
              .catch((error: any) => setError(error.message));
          }
        } catch (error: any) {
          setError(error.message);
          setOwnsPunk(false);
        }
      }
    }
  }

  if (props.connected) {
    return (
      <main className="wrap">
        <div className="nes-field">
          <label htmlFor="name_field">Punk ID</label>
          <input
            type="text"
            maxLength={4}
            className="nes-input is-inline"
            placeholder="0000"
            value={id}
            onChange={(event) => setId(event.target.value.replace(/\D/, ""))}
          />
        </div>

        <menu>
          <Link to="/" className="nes-btn">
            Cancel
          </Link>
          <button
            onClick={handleWrap}
            disabled={!ownsPunk}
            type="button"
            className={!ownsPunk ? "nes-btn is-disabled" : "nes-btn is-primary"}
          >
            {proxyRegistered ? "Wrap" : "Register"}
          </button>
        </menu>

        {<p className="nes-text is-error">{error}</p>}
      </main>
    );
  } else {
    return <main>Connecting...</main>;
  }
}

export default Wrap;
