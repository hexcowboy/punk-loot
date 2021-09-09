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

import emptyPunk from "../assets/emptypunk.png";

function Wrap(props: Web3Props) {
  const [id, setId] = useState<string>("");
  const [ownsPunk, setOwnsPunk] = useState<boolean>(false);
  const [proxyRegistered, setProxyRegistered] = useState<boolean>(false);
  const [punkInProxy, setPunkInProxy] = useState<boolean>(false);
  const [punkIsWrapped, setPunkIsWrapped] = useState<boolean>(false);
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
            const cryptoPunkContract = new props.web3.eth.Contract(
              cryptoPunkABI as AbiItem[],
              cryptoPunkAddress[props.network!]
            );
            const punkOwner = await cryptoPunkContract.methods
              .punkIndexToAddress(id)
              .call();
            const ownerIsProxy = punkOwner === proxyInfo;
            setPunkInProxy(ownerIsProxy);
          } else {
            setPunkInProxy(false);
          }
        } catch (error: any) {
          setError(error.message);
        }

        try {
          if (id) {
            const wrappedPunkContract = new props.web3.eth.Contract(
              wrappedPunkABI as AbiItem[],
              wrappedPunkAddress[props.network!]
            );

            const punkOwner = await wrappedPunkContract.methods
              .ownerOf(id)
              .call();
            const check =
              punkOwner !== "0x0000000000000000000000000000000000000000";
            setPunkIsWrapped(check);
          } else {
            setPunkIsWrapped(false);
          }
        } catch (error) {
          setPunkIsWrapped(false);
        }
      }
    })();
  }, [props.accounts]);

  useEffect(() => {
    (async () => {
      if (props.connected && supportedNetworks.includes(props.network!)) {
        try {
          if (id) {
            const account = props.accounts[0];
            const cryptoPunkContract = new props.web3.eth.Contract(
              cryptoPunkABI as AbiItem[],
              cryptoPunkAddress[props.network!]
            );

            const owner = await cryptoPunkContract.methods
              .punkIndexToAddress(id)
              .call();
            setOwnsPunk(owner.toLowerCase() === account.toLowerCase());
          } else {
            setOwnsPunk(false);
          }
        } catch (error) {
          setOwnsPunk(false);
        }
      }
    })();
  }, [id]);

  async function handleWrap(event: React.MouseEvent<HTMLElement>) {
    if (props.connected && supportedNetworks.includes(props.network!)) {
      const account = props.accounts[0];
      const wrappedPunkContract = new props.web3.eth.Contract(
        wrappedPunkABI as AbiItem[],
        wrappedPunkAddress[props.network!]
      );
      if (ownsPunk) {
        try {
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
            setOwnsPunk(false);
          }
        } catch (error: any) {
          setError(error.message);
        }
      } else {
        if (punkInProxy) {
          await wrappedPunkContract.methods.mint(id).send({ from: account });
        }
      }
    }
  }

  function Button() {
    if (punkIsWrapped) {
      let network = "opensea";
      if (props.network !== "Mainnet") {
        network = "testnets.opensea";
      }
      const address = wrappedPunkAddress[props.network!];
      return (
        <a
          href={`https://${network}.io/assets/${address}/${id}`}
          className="nes-btn is-success"
          target="_blank"
          rel="noreferrer"
        >
          Wrapped
        </a>
      );
    } else if (punkInProxy) {
      return (
        <button
          onClick={handleWrap}
          type="button"
          className="nes-btn is-primary"
        >
          Mint
        </button>
      );
    } else if (proxyRegistered) {
      return (
        <button
          onClick={handleWrap}
          type="button"
          className="nes-btn is-primary"
        >
          Wrap
        </button>
      );
    } else if (ownsPunk) {
      return (
        <button
          onClick={handleWrap}
          type="button"
          className="nes-btn is-primary"
        >
          Register
        </button>
      );
    } else {
      return (
        <button
          onClick={handleWrap}
          disabled
          type="button"
          className="nes-btn is-disabled"
        >
          Wrap
        </button>
      );
    }
  }

  function PunkImage() {
    if (id) {
      try {
        return (
          <img
            src={`https://www.larvalabs.com/public/images/cryptopunks/punk${id.padStart(
              4,
              "0"
            )}.png`}
            alt="CryptoPunk"
            className="punk-image"
          />
        );
      } catch (e) {
        return <img src={emptyPunk} alt="CryptoPunk" className="punk-image" />;
      }
    } else {
      return <img src={emptyPunk} alt="CryptoPunk" className="punk-image" />;
    }
  }

  if (props.connected) {
    return (
      <main className="wrap">
        <div className="nes-container with-title is-centered">
          <p className="title">Wrap</p>
          <PunkImage />
          <div className="nes-field">
            <label htmlFor="name_field">Punk ID</label>
            <menu>
              <input
                type="text"
                maxLength={4}
                className="nes-input is-inline"
                placeholder="0000"
                value={id}
                onChange={(event) =>
                  setId(event.target.value.replace(/\D/, ""))
                }
              />

              <Button />
            </menu>
          </div>
        </div>
        {<p className="nes-text is-error">{error}</p>}

        <Link to="/" className="nes-btn">
          Back
        </Link>
      </main>
    );
  } else {
    return <main>Connecting...</main>;
  }
}

export default Wrap;
