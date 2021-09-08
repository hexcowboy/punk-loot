import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  oracleAddress,
  supportedNetworks,
  wrappedPunkAddress,
  Web3Props,
} from "./App";
import { AbiItem } from "web3-utils";
import web3 from "web3";

import oracleABI from "../abi/Oracle.json";
import wrappedPunkABI from "../abi/WrappedPunk.json";

function Funding(props: { funding: string; minimumFunding: number }) {
  return (
    <>
      <p>
        Balance:{" "}
        <span
          className={
            "nes-text " +
            (parseInt(props.funding) >= props.minimumFunding
              ? "is-success"
              : "is-error")
          }
        >
          {web3.utils.fromWei(props.funding)}
        </span>{" "}
        ETH
      </p>
      <p>
        Minimum:{" "}
        <span className={"nes-text is-primary"}>
          {web3.utils.fromWei(props.minimumFunding.toString())}
        </span>{" "}
        ETH
      </p>
    </>
  );
}

function Punk(props: Web3Props) {
  const [id, setId] = useState<string>("");
  const [ownsPunk, setOwnsPunk] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (props.connected && supportedNetworks.includes(props.network!)) {
        try {
          const account = props.accounts[0];
          const wrappedPunkContract = new props.web3.eth.Contract(
            wrappedPunkABI as AbiItem[],
            wrappedPunkAddress[props.network!]
          );

          if (id) {
            await wrappedPunkContract.methods
              .ownerOf(id)
              .call()
              .then((result: any) => {
                setOwnsPunk(result.toLowerCase() === account.toLowerCase());
              })
              .catch((error: any) => {
                setOwnsPunk(false);
              });
          }
        } catch (error) {
          console.log(error);
          setOwnsPunk(false);
        }
      }
    })();
  }, [id]);

  async function handleClaim() {
    if (props.connected && supportedNetworks.includes(props.network!)) {
      try {
        const account = props.accounts[0];
        const wrappedPunkContract = new props.web3.eth.Contract(
          wrappedPunkABI as AbiItem[],
          wrappedPunkAddress[props.network!]
        );

        await wrappedPunkContract.methods
          .safeTransferFrom(account, oracleAddress[props.network!], id)
          .send({ from: account });
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <div className="nes-field">
      <label htmlFor="name_field">WrappedPunk ID</label>
      <input
        type="text"
        maxLength={4}
        className="nes-input is-inline"
        placeholder="0000"
        value={id}
        onChange={(event) => setId(event.target.value.replace(/\D/, ""))}
      />
      <menu>
        <button
          type="button"
          onClick={handleClaim}
          className={!ownsPunk ? "nes-btn is-disabled" : "nes-btn is-primary"}
        >
          Claim
        </button>
      </menu>
    </div>
  );
}

function Loot(props: Web3Props) {
  const [error, setError] = useState<string | undefined>(undefined);
  const [funding, setFunding] = useState<string>("0");
  const [minimumFunding, setMinimumFunding] = useState<number>(0);

  useEffect(() => {
    (async () => {
      if (props.connected && supportedNetworks.includes(props.network!)) {
        try {
          const account = props.accounts[0];
          const oracleContract = new props.web3.eth.Contract(
            oracleABI as AbiItem[],
            oracleAddress[props.network!]
          );

          const balance = await oracleContract.methods
            .balanceOf(account)
            .call();
          setFunding(balance);

          const minimum = await oracleContract.methods
            .oraclePriceInWei()
            .call();
          setMinimumFunding(minimum);
        } catch (error: any) {
          setError(error.message);
        }
      }
    })();
  }, [props.accounts]);

  async function handleFund() {
    if (props.connected && supportedNetworks.includes(props.network!)) {
      try {
        const account = props.accounts[0];
        const oracleContract = new props.web3.eth.Contract(
          oracleABI as AbiItem[],
          oracleAddress[props.network!]
        );

        await oracleContract.methods.fundOracle().send({
          from: account,
          value: minimumFunding.toString(),
        });
      } catch (error: any) {
        setError(error.message);
      }
    }
  }

  return (
    <main className="loot">
      <div className="nes-container with-title is-centered">
        <p className="title">Funds</p>
        <Funding funding={funding} minimumFunding={minimumFunding} />
        <menu>
          <button
            type="button"
            className="nes-btn is-primary"
            onClick={handleFund}
          >
            Fund
          </button>
        </menu>
      </div>
      <div className="nes-container with-title is-centered">
        <p className="title">Claim Loot</p>
        <Punk {...props} />
      </div>
      <p>{error}</p>
      <Link to="/" className="nes-btn">
        Back
      </Link>
    </main>
  );
}

export default Loot;
