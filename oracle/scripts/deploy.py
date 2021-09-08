from brownie import (
    CryptoPunksMarket,
    Loot,
    Oracle,
    WrappedPunk,
    accounts,
    config,
    network,
)
from rich import print


def main():
    current_network = network.show_active()
    current_account = accounts.add(config["wallets"]["from_key"])

    if current_network == "mainnet":
        # Mainnet deployment
        wrapped_punk_address = "0xb7f7f6c52f2e2fdb1963eab30438024864c313f6"
        print(current_network)
    else:
        # Development deployment
        crypto_punk_address = CryptoPunksMarket[-1]
        wrapped_punk_address = WrappedPunk[-1]

        # constructor(address _wrappedPunksContract, uint256 _oraclePriceInWei)
        oracle = Oracle.deploy(
            wrapped_punk_address,
            100000000000000000,
            {"from": current_account},
            publish_source=True,
        )

        # constructor(string memory name_, string memory symbol_, string memory baseURI_, address oracle_)
        loot = Loot.deploy(
            "Loot (CryptoPunks)",
            "LOOT",
            "https://loot.st/",
            oracle.address,
            {"from": current_account},
            publish_source=True,
        )

        print("Deployments:")
        print(f"CryptoPunksMarket: {crypto_punk_address}")
        print(f"WrappedPunk: {wrapped_punk_address}")
        print(f"Oracle: {oracle.address}")
        print(f"Loot: {loot.address}")
