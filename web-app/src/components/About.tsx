import { Link } from "react-router-dom";

function About() {
  return (
    <main>
      <h3>Loot St</h3>
      <p>
        Discord | <a href="https://github.com/hexcowboy/punk-loot">GitHub</a>
      </p>
      <p>
        Loot St is a decentralized application that converts legacy NFTs into
        Loot NFTs. For example, claiming loot for one Zombie{" "}
        <a href="https://www.larvalabs.com/cryptopunks">CryptoPunk</a> with a
        Beanie and Sunglasses would yield three loot items: a Zombie, a Beanie,
        and Sunglasses. All three loot items would be separately tradable on
        secondary markets like <a href="https://opensea.io/">OpenSea</a>.{" "}
      </p>
      <p>
        In the future, you may be able to use your Punk Loot items to create a
        custom CryptoPunk.
      </p>
      <h3>Connecting</h3>
      <p>
        Right now the only wallet connection provider supported is{" "}
        <a href="https://metamask.io/">MetaMask</a>. You will need to install
        the browser extension to be able to log in to Loot St.
      </p>
      <h3>Wrapping a CryptoPunk</h3>
      <p>
        If your CryptoPunk is{" "}
        <a href="https://www.larvalabs.com/cryptopunks/wrapped">
          already wrapped
        </a>
        , you're ready to claim your loot items. If not, you may use the{" "}
        <Link to="/wrap">"Wrap"</Link> page to start wrapping your CryptoPunk.
      </p>
      <p className="nes-text is-error">
        After completing each of these steps, you may check the progress of the
        transaction by opening the MetaMask menu. Your transaction will be shown
        as "Pending", "Completed", or "Failed".{" "}
      </p>
      <p className="nes-text is-error">
        <strong>
          To prevent lost money from gas fees, do not send more than 1
          transaction at a time.
        </strong>
      </p>
      <ol>
        <li>
          First, you must register the wrapper proxy by clicking the{" "}
          <strong>"Register"</strong> button.
        </li>
        <li>
          Once the proxy is registered, you must send the CryptoPunk to the
          proxy by clicking the <strong>"Wrap"</strong> button.
        </li>
        <li>
          After the CryptoPunk is received by the proxy, you may mint the
          Wrapped CryptoPunk with the <strong>"Mint"</strong> button.
        </li>
      </ol>
      <h3>Claiming Loot</h3>
      <p>
        You may start claiming Punk Loot once you are in possession of a Wrapped
        CryptoPunk.
      </p>
      <p className="nes-text is-error">
        After completing each of these steps, you may check the progress of the
        transaction by opening the MetaMask menu. Your transaction will be shown
        as "Pending", "Completed", or "Failed".{" "}
      </p>
      <p className="nes-text is-error">
        <strong>
          To prevent lost money from gas fees, do not send more than 1
          transaction at a time.
        </strong>
      </p>
      <p>
        Because Punk Loot requires an oracle to be minted, the oracle needs to
        be funded. On the <Link to="/loot">"Loot"</Link> page you will see the{" "}
        <strong>"Cost"</strong> of the oracle which represents how much ether is
        required to perform 1 loot claim. If you plan to claim loot for 1
        CryptoPunk, 0.1 ether is sufficient. If you plan to claim more, it would
        make sense to provide 0.1 ether for every 1 CryptoPunk you plan to claim
        loot for. Enter the amount and click the <strong>"Fund"</strong> button
        to fund the oracle.
      </p>
      <p>
        After the oracle is funded, you may now send your WrappedPunk to the
        oracle. Enter the WrappedPunk ID and click the <strong>"Claim"</strong>{" "}
        button.
      </p>
      <p>
        Once the oracle receives the transaction, it sends out a new transaction
        to mint the loot. You may view the oracle status at the{" "}
        <Link to="/status">"Status"</Link> page. During times of network
        congestion, it may take a while before the Loot shows up in your
        account. There is no way to speed up the process, but if your
        transaction is stuck for 30+ minutes, post in the Discord server.
      </p>
      <h3>Help</h3>
      <p>
        Source code is available at{" "}
        <a href="https://github.com/hexcowboy/punk-loot">
          github.com/hexcowboy/punk-loot
        </a>{" "}
      </p>
      <p>Community-driven support may be availabe in the Discord server.</p>
      <h3>Privacy</h3>
      <p>
        Loot St does not store cookies, collect user data, or provide warranty.
        This is a free and open source decentralized application. Report
        security issues to hexcowboy {"<"}
        <a href="mailto://hex@cowboy.dev">hex@cowboy.dev</a>
        {">"}
      </p>
    </main>
  );
}

export default About;
