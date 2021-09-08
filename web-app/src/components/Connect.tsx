import { useState } from "react";
import MetaMaskOnboarding from "@metamask/onboarding";
import { Web3Props } from "./App";

function Connect(props: Web3Props) {
  const [error, setError] = useState("");
  const [disabled, setDisabled] = useState(false);

  const handleConnect = async (data: string) => {
    switch (data) {
      case "metamask":
        if (typeof (window as any).ethereum !== "undefined") {
          setDisabled(true);
          (window as any).ethereum
            .request({
              method: "eth_requestAccounts",
            })
            .then(async () => {
              props.setAccounts(
                await (window as any).ethereum.request({
                  method: "eth_requestAccounts",
                })
              );
              setDisabled(false);
            })
            .catch((error: any) => {
              if (error.code === 4001) {
                setError("Rejected. Please refresh to try again.");
              } else {
                setError(error.message);
              }
            });
        } else {
          const onboarding = new MetaMaskOnboarding();
          onboarding.startOnboarding();
        }
        break;
    }
  };

  return (
    <>
      <button
        onClick={() => handleConnect("metamask")}
        type="button"
        className={
          disabled ? "nes-btn is-disabled" : "nes-btn is-primary"
        }
        disabled={disabled}
      >
        Connect
      </button>
      {error && <p className="nes-text is-error">{error}</p>}
    </>
  );
}

export default Connect;
