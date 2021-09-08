import { Web3Props, supportedNetworks } from "./App";

function Footer(props: Web3Props) {
  const connectionString = () => {
    if (props.connected) {
      if (supportedNetworks.includes(props.network!)) {
        return `${props.network} ${props.accounts[0].substring(0, 8)}`;
      } else {
        return `${props.network} not supported`;
      }
    } else {
      return "Not Connected";
    }
  };
  return (
    <footer>
      <p>
        <span
          className="connection-status"
          id={
            props.connected && supportedNetworks.includes(props.network!)
              ? "connected"
              : "disconnected"
          }
        ></span>
        {connectionString()}
      </p>
    </footer>
  );
}

export default Footer;
